import dataclasses
import typing
from model_interface import PrefixTemplate, PrefixedModel
import hf_model
import open_ai_model
from model_interface import ModelInterface

class ModelDef(typing.TypedDict):
    name: str
    model: ModelInterface

class ModelMeta(typing.TypedDict):
    name: str

@dataclasses.dataclass
class MultiModelProvider(ModelInterface):
    models: dict[str, ModelDef]

    def gen(self, model_id: str, text: str, max_length=50) -> str:
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        return self.models[model_id]["model"].gen(text, max_length)
    
    def get_model_meta(self) -> dict[str, str]:
        return {k: ModelMeta(name=v["name"]) for k, v in self.models.items()}

shakespeare = PrefixTemplate("Shakespeare", "The following text is in the style of william shakespeare: ")
gpt2_model = hf_model.HfModel('gpt2')
davinci_model = open_ai_model.OAIModel('text-davinci-003')

multi_model = MultiModelProvider( # TODO: these probably need to be functions so we can instantiate them in processes
    {
        'gpt2': {
            "name": "GPT2",
            "model": gpt2_model
        },
        'gpt2-shakespeare': {
            "name": "GPT2 Shakespeare",
            "model": PrefixedModel(shakespeare, gpt2_model)
        },
        'davinci': {
            "name": "Davinci",
            "model": davinci_model
        },
        'davinci-shakespeare': {
            "name": "Davinci Shakespeare",
            "model": PrefixedModel(shakespeare, davinci_model)
        }
    }
)