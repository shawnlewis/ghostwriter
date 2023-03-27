import dataclasses
import functools
import time
import typing
import wandb
import datetime

@dataclasses.dataclass
class PredictionRecord:
    _timestamp: datetime.datetime
    _prediction_id: str
    _latency: float
    _inputs: dict
    _output: typing.Any
    _additional_data: dict
    _wandb_run: typing.Any
    _raw_output: typing.Any = None

    def get(self):
        return self._raw_output

    def add_data(self, data: dict) -> None:
        self._additional_data.update(data)

    def as_dict(self):
        return {
                "timestamp": self._timestamp,
                "prediction_id": self._prediction_id,
                "latency": self._latency,
                **self._inputs,
                # "inputs": self._inputs,
                "prediction": self._output,
                **self._additional_data,
            }

class Monitor:
    MAX_UNSAVED_COUNT = 2
    MAX_UNSAVED_SECONDS = 5

    def __init__(self, fn, input_preprocessor, output_postprocessor, auto_commit=True):
        self.fn = fn
        if input_preprocessor is None:
            input_preprocessor = lambda kwargs: kwargs
        if output_postprocessor is None:
            output_postprocessor = lambda x: x
        self.input_preprocessor = input_preprocessor
        self.output_postprocessor = output_postprocessor
        self.auto_commit = auto_commit

        self.unsaved_count = 0
        self.last_saved_timestamp = datetime.datetime.now()

        self.record = None
        self.records = []


    def __call__(self, *args, **kwargs):
        if len(args) > 0:
            raise ValueError("Only keyword arguments are supported for now.")
        start_time = time.time()
        result = self.fn(**kwargs)
        duration = time.time() - start_time
        inputs = self.input_preprocessor(kwargs)
        output = self.output_postprocessor(result)
        additional_data = {}
        run = wandb.run if wandb.run else wandb.init()
        self.record = PredictionRecord(
            _timestamp=datetime.datetime.now(),
            _prediction_id=str(int(datetime.datetime.now().timestamp())),
            _latency=duration,
            _inputs=inputs,
            _output=output,
            _additional_data=additional_data,
            _wandb_run=run,
            _raw_output=result,
        )

        if self.auto_commit:
            self.commit()

        return self.record

    def commit(self):
        print('Committing record', self.record)
        self.records.append(self.record)
        self.record = None
        self.unsaved_count += 1

        print('monitor state', self.unsaved_count, self.last_saved_timestamp)
        if self.unsaved_count < Monitor.MAX_UNSAVED_COUNT or self.last_saved_timestamp > datetime.datetime.now() - datetime.timedelta(seconds=Monitor.MAX_UNSAVED_SECONDS):
            return
        print('commiting artifact')

        r0_dict = self.records[0].as_dict()
        table = wandb.Table(list(r0_dict.keys()))
        # reversed time order
        for r in reversed(self.records):
            r_dict = r.as_dict()
            if list(r0_dict.keys()) != list(r_dict.keys()):
                # TODO: we can easily fix this (grow columns) but for now just raise.
                raise ValueError("The columns of the table are not consistent.")
            table.add_data(*list(r_dict.values()))
        wandb.run.summary['predictions'] = table
        self.unsaved_count = 0
        self.last_saved_timestamp = datetime.datetime.now()



def monitor(commit=True, input_preprocessor=None, output_postprocessor=None):
    def monitor_inner(fn):
        return Monitor(fn, input_preprocessor, output_postprocessor, auto_commit=commit)

    return monitor_inner
