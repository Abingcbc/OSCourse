def evalPro(s):
    i = 0
    while i < len(s):
        if s[i] != '0':
            break
        i += 1
    if i == len(s):
        return 0
    return eval(s[i:])