from evaluate import load

def get_analysis(text):
    pred = [text]
    tox = toxicity(pred)
    perp = perplexity(pred)
    wc, uniq = word_count(pred)
    return {
        "word_count" : wc,
        "unique" : uniq,
        "toxicity" : tox,
        "perplexity" : perp,
    }

# metrics we may care about: perplexity, word_count, toxicity
def perplexity(text_list):
    perplexity= load("perplexity",  module_type= "measurement")
    results = perplexity.compute(data=text_list, model_id='gpt2')
    return results["perplexities"][0]

def word_count(text_list):
    # expect input to be a list of length exactly one,
    # and the first element to be a string of length at least one
    if len(text_list) != 1 or len(text_list[0]) < 1:
        return 0, 0
    wc = load("word_count", module_type="measurement")
    try:
        res = wc.compute(data=text_list)
        count = res["total_word_count"]
        unique =  res["unique_words"]
        fraq_unique = float(unique) / float(count)
    except:
        count = 0
        fraq_unique = 0
    return count, fraq_unique

def toxicity(text_list):
    tox = load("toxicity", module_type="measurement")
    results = tox.compute(predictions=text_list)
    return results["toxicity"][0]

