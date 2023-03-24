from transformers import pipeline


class HfModel:
    def __init__(self, model_name):
        self.model = pipeline('text-generation', model=model_name)

    def gen(self, text, max_length=50):
        return self.model(text, max_length=max_length)[0]['generated_text'][len(text):]


if __name__ == '__main__':
    model = HfModel('gpt2')
    print(model.gen("Hello, I'm a language model"))
