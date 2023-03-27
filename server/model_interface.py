import dataclasses

class ModelInterface:
    def gen(self, text: str, max_length=50, _extra={}) -> str:
        raise NotImplementedError()
    
    def name(self) -> str:
        raise NotImplementedError()
    
    def provider(self) -> str:
        raise NotImplementedError()
    
    def id(self) -> str:
        return f"{self.provider()}-{self.name()}"

@dataclasses.dataclass
class PrefixTemplate:
    short_name: str
    template: str

@dataclasses.dataclass
class PrefixedModel(ModelInterface):
    template: PrefixTemplate
    raw_model: ModelInterface

    def gen(self, text: str, max_length=50, _extra={}) -> str:
        return self.raw_model.gen(f"{self.template.template} {text}", max_length, _extra)
    
    def name(self) -> str:
        return f"{self.raw_model.name()}-{self.template.short_name}"
    
    def provider(self) -> str:
        return self.raw_model.provider()

