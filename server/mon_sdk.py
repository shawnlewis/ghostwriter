import dataclasses
import functools
import time
import typing
import wandb
import datetime

from evaluate import load

# metrics we may care about: perplexity, word_count, toxicity
def perplexity(text_list):
    perplexity= load("perplexity",  module_type= "measurement")
    results = perplexity.compute(data=text_list, model_id='gpt2')
    return results["perplexities"]

def word_count(text_list):
    if len(text_piece) < 2:
        return 0, 0
    wc = load("word_count", module_type="measurement")
    res = wc.compute(data=text_list)
    count = res["total_word_count"]
    unique =  res["unique_words"]
    try:
        fraq_unique = float(unique) / float(count)
    except:
        fraq_unique = 0
  return count, fraq_unique

def toxicity(text_list):
    tox = load("toxicity", module_type="measurement")
    results = tox.compute(predictions=text_list)
    return results["toxicity"]

@dataclasses.dataclass
class PredictionRecord:
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

    def log(self, compute_eval_metrics=True):
        if compute_eval_metrics:
            pred = [self._output]
            tox = toxicity(pred)
            perp = perplexity(pred)
            wc, uniq = word_count(pred)
            record = {
                "prediction_id": self._prediction_id,
                "latency": self._latency,
                **self._inputs,
                # "inputs": self._inputs,
                "prediction": self._output,
                "word_count" : wc,
                "unique" : uniq,
                "toxicity" : tox,
                "perplexity" : perp,
                **self._additional_data,
            }
            print("record", record)
            self._wandb_run.log(record)


        else:   
            record = {
                "prediction_id": self._prediction_id,
                "latency": self._latency,
                **self._inputs,
                # "inputs": self._inputs,
                "prediction": self._output,
                **self._additional_data,
            }
            print("record", record)
            self._wandb_run.log(record)


def monitor(commit=True, input_preprocessor=None, output_postprocessor=None):
    if input_preprocessor is None:
        input_preprocessor = lambda kwargs: kwargs
    if output_postprocessor is None:
        output_postprocessor = lambda x: x

    def monitor_inner(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            if len(args) > 0:
                raise ValueError("Only keyword arguments are supported for now.")
            start_time = time.time()
            result = fn(**kwargs)
            duration = time.time() - start_time
            inputs = input_preprocessor(kwargs)
            output = output_postprocessor(result)
            additional_data = {}
            run = wandb.run if wandb.run else wandb.init()
            record = PredictionRecord(
                _prediction_id=str(int(datetime.datetime.now().timestamp())),
                _latency=duration,
                _inputs=inputs,
                _output=output,
                _additional_data=additional_data,
                _wandb_run=run,
                _raw_output=result,
            )

            if commit:
                record.log()
                return result

            return record

        return wrapper

    return monitor_inner
