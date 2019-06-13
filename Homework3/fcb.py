class FCB:
    def __init__(self, name, file_type, pos, create_time, update_time, size, first_block, write_user,
                 read_user, delete_able, is_able):
        self.name = name
        self.type = file_type
        self.pos = pos
        self.creat_time = create_time
        self.update_time = update_time.strip()
        self.size = size
        self.first_block = first_block
        self.write_user = write_user
        self.read_user = read_user
        self.delete_able = delete_able
        self.is_able = is_able
        self.child_list = []

    def writeToDiskFirstLine(self):
        if self.type == '-1':
            return '-1\n'
        return self.name + ' ' + self.type + ' ' + str(self.pos) + ' ' + self.creat_time + ' ' + self.update_time + '\n'

    def writeToDiskSecondLine(self):
        if self.type == '-1':
            return '-1\n'
        return str(self.size) + ' ' + self.first_block + ' ' + self.write_user + ' ' + self.read_user + ' ' + str(
            self.delete_able) + ' ' + str(self.is_able) + '\n'

    def checkWriteRight(self, user):
        if user in self.write_user.split('_'):
            return True
        else:
            return False

    def checkReadRight(self, user):
        if user in self.read_user.split('_'):
            return True
        else:
            return False
