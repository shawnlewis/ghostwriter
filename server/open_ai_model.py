from model_interface import ModelInterface

import os
import openai

openai.organization = os.getenv("OPENAI_ORG_ID")
openai.api_key = os.getenv("OPENAI_API_KEY")


class OAIModel(ModelInterface):
    def __init__(self, model_name, model_params={}):
        self._name = model_name
        self._model_params = model_params

    def gen(self, text, max_length=50, _extra={}):
        return openai.Completion.create(
            model=self._name,
            prompt=text,
            max_tokens=max_length,
            **self._model_params,
        )["choices"][0]["text"]
    
    def name(self) -> str:
        return self._name
    
    def provider(self) -> str:
        return 'openai'


if __name__ == '__main__':
    model = OAIModel('text-davinci-003')
    print(model.gen('The quick brown fox jumped over the lazy dog.'))
