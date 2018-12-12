# 
# Check for nodes that are not connected to anything else and output a list
# 

import json
from pprint import pprint

orphan_nodes = {}
orphan_nodes_file = open('orphanNodes.csv','w')
orphan_nodes_file.write("NodeID,Count\n")\

# Input: Watson workspace dump JSON
with open('../workspaces/staging.json') as f:
    data = json.load(f)
    for node in data['dialog_nodes']:
        # import pdb;pdb.set_trace()
        nodeID = node['dialog_node']
        if nodeID in orphan_nodes:
            orphan_nodes[nodeID] += 1
        else:
            orphan_nodes[nodeID] = 1
        
        if node['next_step']:
            if 'dialog_node' in node['next_step']:
                jumpToNodeID = node['next_step']['dialog_node']
                if jumpToNodeID in orphan_nodes:
                    orphan_nodes[jumpToNodeID] += 1
                else:
                    orphan_nodes[jumpToNodeID] = 1

        if node['parent']:
            if node['parent']:
                parentNodeID = node['parent']
                if parentNodeID in orphan_nodes:
                    orphan_nodes[parentNodeID] += 1
                else:
                    orphan_nodes[parentNodeID] = 1

        if node['previous_sibling']:
            if node['previous_sibling']:
                previous_siblingNodeID = node['previous_sibling']
                if previous_siblingNodeID in orphan_nodes:
                    orphan_nodes[previous_siblingNodeID] += 1
                else:
                    orphan_nodes[previous_siblingNodeID] = 1
        # import pdb;pdb.set_trace()
        # if node['output']:
        #     if node['output'].keys()[0] == 'generic':
        #         # import pdb;pdb.set_trace()
        #         for response in node['output']['generic']:
        #             if response['response_type'] == 'text':
        #                 for value in response['values']:
        #                     data = value['text']
        #                     if data:
        #                         # import pdb;pdb.set_trace()
        #                         # print textstat.flesch_reading_ease(data.encode('ascii','ignore'))
        #                         text = data.encode('ascii','ignore').replace('"','\'')
        #                         score = textstat.flesch_reading_ease(text)
        #                         if score < 60:
        #                             if text not in orphan_nodes:
        #                                 orphan_nodes.append(text)
        #                                 orphan_nodes_file.write('\"%s\",%s\n' % (text, score))
        #                         if score >= 60:
        #                             if text not in above_standard:
        #                                 above_standard.append(text)
        #                                 above_standard_file.write('\"%s\",%s\n' % (text, score))
f.close()


for n in orphan_nodes:
    orphan_nodes_file.write('\"%s\",%s\n' % (n, orphan_nodes[n]))

# Output A: produce a list of orphan nodes in the dialogue tree marked for potential deletion
orphan_nodes_file.close()

