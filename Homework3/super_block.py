class SuperBlock:
    def __init__(self, file: str):
        attr_list = file.split(" ")
        self.all_block = eval(attr_list[0])
        self.block_size = eval(attr_list[1])
        self.free_block = eval(attr_list[2])
        self.free_fcb = eval(attr_list[3])

    def writeToDisk(self):
        return str(self.all_block) + " " + str(self.block_size) + " " + str(self.free_block) + " " + str(self.free_fcb)
