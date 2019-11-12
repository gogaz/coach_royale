def int_difference_instances(obj1, obj2, excluded_keys=()):
    d1 = obj1.__dict__
    d2 = {}
    if obj2 is not None:
        d2 = obj2.__dict__

    res = {}
    for k, v in d1.items():
        if k in excluded_keys:
            continue
        if isinstance(v, int):
            try:
                if v != d2[k] and d2[k] is not None:
                    res.update({k: v - d2[k]})
            except KeyError:
                res.update({k: v})

    return res
