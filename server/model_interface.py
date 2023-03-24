import dataclasses

# @dataclasses.dataclass
class ModelInterface:
    def gen(self, text: str, max_length=50) -> str:
        raise NotImplementedError()
    
    def name(self) -> str:
        raise NotImplementedError()
    
    def provider(self) -> str:
        raise NotImplementedError()

@dataclasses.dataclass
class PrefixTemplate:
    short_name: str
    template: str

@dataclasses.dataclass
class PrefixedModel(ModelInterface):
    template: PrefixTemplate
    raw_model: ModelInterface

    def gen(self, text: str, max_length=50) -> str:
        return self.raw_model.gen(f"{self.template.template} {text}", max_length)
    
    def name(self) -> str:
        self.raw_model.name()
    
    def provider(self) -> str:
        self.raw_model.provider()


@dataclasses.dataclass
class MultiModelProvider(ModelInterface):
    models: dict[str, ModelInterface]

    def gen(self, model_id: str, text: str, max_length=50) -> str:
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        return self.models[model_id].gen(text, max_length)