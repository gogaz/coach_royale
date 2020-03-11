import random


class Factory:
    @classmethod
    def random_tag(cls, length=3):
        tag = ''
        for i in range(length):
            tag += chr(random.randint(65, 90) if i % 3 == 0 else random.randint(48, 57))
        return tag
