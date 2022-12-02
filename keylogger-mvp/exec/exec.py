def binomial2(n, k):
    



          


import sys
import json

# pass lang, num args, func name, and file path
f = open("prob.json")
problem = json.load(f)["problem"]
f.close()

lang = problem['lang']
num_args = len(problem['types']) - 1
tests = problem['testCases']
types = problem['types']
answers = problem['answers']

def type_conv(type_str, val):
    if type_str == "int":
        return int(val)
    elif type_str == "str":
        return val
    elif type_str == "float":
        return float(val)
    elif type_str == int_lst:
        res = val.strip('][').split(', ')
        return [int(i) for i in res]
    elif type_str == float_lst:
        res = ini_list.strip('][').split(', ')
        return [float(i) for i in res]
    elif type_str == str_lst:
        return ini_list.strip('][').split(', ')
    else:
        raise Exception(f"Type {type_str} not supported yet")

for i in range(len(tests)):
    if not type_conv(types[-1], answers[i]) == binomial2(type_conv(types[0], tests[i].split()[0]),type_conv(types[1], tests[i].split()[1])):
        print(i)

