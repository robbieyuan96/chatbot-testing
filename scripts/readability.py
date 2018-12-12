# 
# Generates a readability score using The Flesch Reading Ease formula
# https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests#Flesch_reading_ease
# Implemented with https://github.com/shivam5992/textstat
# 

import json
from pprint import pprint
from textstat.textstat import textstat


below_standard = []
below_standard_file = open('belowStandard.csv','w')
below_standard_file.write("Text,Score\n")

above_standard = []
above_standard_file = open('aboveStandard.csv','w')
above_standard_file.write("Text,Score\n")

# Input: Watson workspace dump JSON
with open('../workspaces/staging.json') as f:
    data = json.load(f)
    for node in data['dialog_nodes']:
        if node['output']:
            if node['output'].keys()[0] == 'generic':
                # import pdb;pdb.set_trace()
                for response in node['output']['generic']:
                    if response['response_type'] == 'text':
                        for value in response['values']:
                            data = value['text']
                            if data:
                                # import pdb;pdb.set_trace()
                                # print textstat.flesch_reading_ease(data.encode('ascii','ignore'))
                                text = data.encode('ascii','ignore').replace('"','\'')
                                score = textstat.flesch_reading_ease(text)
                                if score < 60:
                                    if text not in below_standard:
                                        below_standard.append(text)
                                        below_standard_file.write('\"%s\",%s\n' % (text, score))
                                if score >= 60:
                                    if text not in above_standard:
                                        above_standard.append(text)
                                        above_standard_file.write('\"%s\",%s\n' % (text, score))

# Output A: a list of text responses with associated readability score above standard (easy for reader to understand)
above_standard_file.close()
# Output B: a list of text responses with associated readability score below standard (difficult for reader to understand)
below_standard_file.close()
f.close()
