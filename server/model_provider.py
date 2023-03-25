import dataclasses
import multiprocessing
import typing

import wandb
from model_interface import PrefixTemplate, PrefixedModel
import hf_model
import open_ai_model
from model_interface import ModelInterface
from mon_sdk import monitor

class ModelMeta(typing.TypedDict):
    name: str

@dataclasses.dataclass
class MultiModelProvider(ModelInterface):
    models: dict[str, ModelInterface]

    def gen(self, model_id: str, text: str, max_length=50) -> str:
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        return self.models[model_id].gen(text, max_length)
    
    def get_model_meta(self) -> dict[str, str]:
        return {k: ModelMeta(name=v.name()) for k, v in self.models.items()}
    
    @classmethod
    def from_models(cls, models: list[ModelInterface]) -> "MultiModelProvider":
        return cls({m.id(): m for m in models})

@dataclasses.dataclass
class SubprocessWBModelProviderRequest:
    text: str
    max_length: int

import atexit
class SubprocessWBModelProvider(ModelInterface):
    process = None
    req_queue = None
    resp_queue = None
    sub_model = None

    def __init__(self, model:ModelInterface):
        self.sub_model = model

    def name(self) -> str:
        return self.sub_model.name()
    
    def provider(self) -> str:
        return self.sub_model.provider()
    
    def gen(self, text: str, max_length=50) -> str:
        if self.process is None:
            self.req_queue = multiprocessing.Queue()
            self.resp_queue = multiprocessing.Queue()
            self.process = multiprocessing.Process(target=loop, args=(self.req_queue, self.resp_queue, self.sub_model))
            self.process.start()
            atexit.register(self.shutdown)
        self.req_queue.put(SubprocessWBModelProviderRequest(text, max_length))
        return self.resp_queue.get()
    
    def shutdown(self):
        if self.process is not None:
            self.req_queue.put(None)
            self.process.join()
            self.process = None
            self.req_queue = None
            self.resp_queue = None
    

def loop(req_queue:multiprocessing.Queue, resp_queue:multiprocessing.Queue, model: ModelInterface):
    model_id = model.id()
    run = wandb.init(config={"model_id": model_id})

    # Make model artifact...
    file_name = f"{model_id}.model.txt"
    with open(file_name, "w") as f:
        f.write("my_model")
    
    model_name = f"model_{model_id}"

    # So ugly! Damnit! Why don't we actually fix the artifact APIs!!!? This is a
    # total hack for the demo and doesn't even do the right thing. All we are
    # doing is making sure that the artifact is created and then we are linking
    # it to the run. This is because we can't call `use_artifact` on an artifact
    # that already is linked... OMG!
    try:
        art = wandb.Api().artifact(run.project + "/" + model_name + ":latest")
    except Exception as e:
        print("Creating artifact", e)
        art = wandb.Artifact(model_name, type="model")
        art.add_file(file_name)
    run.use_artifact(art)

    run.link_artifact(art, target_path=f"model-registry/{model_name}")

    @monitor(False)
    def get_gen(text, max_length):
        return model.gen(text, max_length)

    while True:
        req = req_queue.get()
        if req is None:
            break
        res = get_gen(text=req.text, max_length=req.max_length)
        res.add_data({
            "model_id": model_id,
        })
        res.log()
        resp_queue.put(res.get())
    run.finish()


shakespeare = PrefixTemplate("Shakespeare", "The following text is in the style of william shakespeare: ")
gpt2_model = hf_model.HfModel('gpt2')
davinci_model = open_ai_model.OAIModel('text-davinci-003')

multi_model = MultiModelProvider.from_models([
    SubprocessWBModelProvider(gpt2_model),
    SubprocessWBModelProvider(PrefixedModel(shakespeare, gpt2_model)),
    SubprocessWBModelProvider(davinci_model),
    SubprocessWBModelProvider(PrefixedModel(shakespeare, davinci_model)),
])


if __name__ == '__main__':
    print(multi_model.gen('huggingface-gpt2', 'Hello, I am a language model', 50))
    print(multi_model.gen('huggingface-gpt2-Shakespeare', 'Hello, I am a language model', 50))
    
