def fizzbuzz(n):
    if n % 3 == 0 and n % 5 == 0:
        return "FizzBuzz"
    elif n % 5 == 0:
        return "Fizz"
    elif n % 3 == 0:
        return "Buzz"
    else:
        return ""


    # divisors = []
    # for i in range(1, n + 1):
    #     if n % i == 0:
    #         divisors.append(i)
    # return divisors



    


    

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
    if type_str.strip() == "int":
        return int(val)
    elif type_str.strip() == "string":
        return val[1:len(val)-1]
    elif type_str.strip() == "float":
        return float(val)
    elif type_str.strip() == 'int_list':
        res = val.strip('][').split(', ')
        return [int(i) for i in res]
    elif type_str.strip() == 'float_list':
        res = val.strip('][').split(', ')
        return [float(i) for i in res]
    elif type_str.strip() == 'string_list':
        return val.strip('][').split(', ')
    else:
        raise Exception(f"Type {type_str} not supported yet")

for i in range(len(tests)):
    if not type_conv(types[-1], answers[i]) == fizzbuzz(type_conv(types[0], tests[i].split(',')[0])):
        print(i)

