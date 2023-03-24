import dataclasses

from transformers import pipeline

from model_interface import ModelInterface

# @dataclasses.dataclass
class HfModel(ModelInterface):
    def __init__(self, model_name):
        self._model = pipeline('text-generation', model=model_name)
        self._name = model_name

    def gen(self, text, max_length=50):
        return self._model(text, max_length=max_length)[0]['generated_text'][len(text):]
    
    def name(self) -> str:
        return self._name
    
    def provider(self) -> str:
        return 'huggingface'


# if __name__ == '__main__':
#     model = HfModel('gpt2')
#     print(model.gen("Hello, I'm a language model"))
