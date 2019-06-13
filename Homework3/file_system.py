import os
import setup
import super_block
from fcb import FCB
import fat
import dictionary
import datetime
from utils import evalPro


class FileSystem:
    def __init__(self):
        self.super_block = None
        self.fat = None
        self.dictionary = None
        self.data = []
        self.initFromFile()

    def initFromFile(self):
        setup.init()
        with open('disk.txt') as file:
            line = file.readline()
            self.super_block = super_block.SuperBlock(line)
            block_bitmap = ""
            for i in range(128):
                block_bitmap += file.readline().strip()
            self.fat = fat.FAT(block_bitmap)
            fcb_bitmap = ""
            for i in range(4):
                fcb_bitmap += file.readline().strip()
            fcb_list = []
            for i in range(512):
                line = file.readline()
                attr_list = line.split(" ")
                line = file.readline()
                attr_list += line.split(" ")
                # name file_type pos create_time update_time
                # size first_block write_user read_user delete_able is_able
                if line == "-1\n":
                    fcb_list.append(FCB('-1', '-1', -1, '-1', '-1', -1, '-1', '-1', '-1', -1, -1))
                    continue
                fcb_list.append(
                    FCB(attr_list[0], attr_list[1], evalPro(attr_list[2]), attr_list[3], attr_list[4],
                        evalPro(attr_list[5]), attr_list[6], attr_list[7], attr_list[8], evalPro(attr_list[9]),
                        evalPro(attr_list[10])))
                if evalPro(attr_list[10]) == 1 and evalPro(attr_list[2]) >= 0:
                    fcb_list[evalPro(attr_list[2])].child_list.append(i)
            self.dictionary = dictionary.Dictionary(fcb_bitmap, fcb_list)
            for i in range(2048):
                self.data.append(file.readline().strip())

    def reformat(self):
        os.remove('disk.txt')
        self.initFromFile()

    def locateFolder(self, path_list):
        current = 0
        if len(path_list) > 1:
            for file in path_list[1:]:
                for i in self.dictionary.fcb_list[current].child_list:
                    if self.dictionary.fcb_list[i].name == file:
                        current = i
                        break
        return current

    def getFileChildren(self, path):
        path_list = path.split("_")
        current = 0
        if len(path_list) > 1:
            for file in path_list[1:]:
                for i in self.dictionary.fcb_list[current].child_list:
                    if self.dictionary.fcb_list[i].name == file:
                        current = i
                        break
        return self.dictionary.fcb_list[current].child_list

    def getCurFile(self, path, file_type='file'):
        if path == 'root':
            return self.dictionary.fcb_list[0]
        path_list = path.split("_")
        # locate required folder
        current = self.locateFolder(path_list[0:-1])
        # locate required file
        for file in self.dictionary.fcb_list[current].child_list:
            if self.dictionary.fcb_list[file].name == path_list[-1] and self.dictionary.fcb_list[
                file].type == file_type:
                return self.dictionary.fcb_list[file]

    def getCurFileLocation(self, path):
        path_list = path.split("_")
        # locate required folder
        current = self.locateFolder(path_list[0:-1])
        # locate required file
        for file in self.dictionary.fcb_list[current].child_list:
            if self.dictionary.fcb_list[file].name == path_list[-1]:
                return file

    def createFile(self, path, name, file_type, writer_user, read_user):
        fcb_address = self.dictionary.getAndSetFirstFreeFCB()
        if fcb_address < 0:
            return -2
        path_list = path.split("_")
        current = self.locateFolder(path_list)
        for child in self.dictionary.fcb_list[current].child_list:
            if self.dictionary.fcb_list[child].name == name and self.dictionary.fcb_list[child].type == file_type:
                return -1
        fcb = FCB(name, file_type, current, datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X'),
                  datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X'), 0, '-1', writer_user, read_user,
                  1, 1)
        self.super_block.free_fcb -= 1
        self.dictionary.fcb_list[fcb_address] = fcb
        self.dictionary.fcb_list[current].child_list.append(fcb_address)
        self.updateParentSize(fcb_address, 0)
        return 1

    def updateParentSize(self, file_loc, change_size):
        current = self.dictionary.fcb_list[file_loc].pos
        while current != -1:
            self.dictionary.fcb_list[current].size += change_size
            self.dictionary.fcb_list[current].update_time = datetime.datetime.strftime(datetime.datetime.now(),
                                                                                       '%Y-%m-%d-%X')
            current = self.dictionary.fcb_list[current].pos

    def deleteFile(self, path, user, file_type):
        if self.getCurFile(path, file_type).checkWriteRight(user) and self.getCurFile(path, file_type).delete_able == 1:
            loc = self.getCurFileLocation(path)
            self.updateParentSize(loc, self.dictionary.fcb_list[loc].size)
            self.deleteChild(loc)
            return "1"
        else:
            return "-1"

    def deleteChild(self, loc):
        for child in self.dictionary.fcb_list[loc].child_list:
            self.deleteChild(child)
        if self.dictionary.fcb_list[loc].delete_able == 1:
            self.dictionary.updateBitmap(loc, '0')
            # Only set it unable rather than directly delete it!
            self.dictionary.fcb_list[loc].is_able = '0'
            self.super_block.free_block += self.fat.deleteFile(self.dictionary.fcb_list[loc].first_block)
            parent = self.dictionary.fcb_list[self.dictionary.fcb_list[loc].pos]
            parent.child_list.remove(loc)
            self.super_block.free_fcb += 1

    def openFileContent(self, path, user):
        fcb = self.getCurFile(path)
        if not fcb.checkReadRight(user):
            return {'state': -1, 'content': ''}
        current = fcb.first_block
        content = ''
        if current != '-1':
            while current != "----":
                content += self.data[evalPro(current)]
                current = self.fat.bitmap[evalPro(current) * 4:evalPro(current) * 4 + 4]
        if fcb.checkWriteRight(user):
            return {'state': 2, 'content': content}
        else:
            return {'state': 1, 'content': content}

    '''
    @:return '-1': no right
             '-2': no space
             '1': success
    '''

    def updateFileContent(self, path, content, user):
        fcb = self.getCurFile(path)
        if not fcb.checkWriteRight(user):
            return '-1'
        pre_size = fcb.size
        current = fcb.first_block
        if current != '-1':
            while self.fat.bitmap[evalPro(current) * 4:evalPro(current) * 4 + 4] != '----':
                temp = self.fat.bitmap[evalPro(current) * 4:evalPro(current) * 4 + 4]
                self.fat.updateBitmap(evalPro(current), '0000')
                current = temp
                self.super_block.free_block += 1
            self.fat.updateBitmap(evalPro(current), '0000')
            self.super_block.free_block += 1
        fcb.size = 0
        if self.super_block.free_block <= 0:
            print(len(self.fat.bitmap))
            return '-2'
        fcb.first_block = str(self.fat.getFirstFreeBlock())
        if len(content) > self.super_block.block_size:
            if self.super_block.free_block <= 0:
                fcb.update_time = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')
                print(len(self.fat.bitmap))
                return '-2'
            add_loc = self.fat.getFirstFreeBlock()
            self.data[add_loc] = content[0:self.super_block.block_size]
            self.fat.updateBitmap(add_loc, '----')
            content = content[self.super_block.block_size:]
            self.super_block.free_block -= 1
            fcb.size = 1
            while len(content) > 0:
                if self.super_block.free_block <= 0:
                    fcb.update_time = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')
                    print(len(self.fat.bitmap))
                    return '-2'
                self.fat.updateBitmap(add_loc, str(self.fat.getFirstFreeBlock()))
                add_loc = self.fat.getFirstFreeBlock()
                if add_loc == 2047:
                    print('2047')
                self.data[add_loc] = content[0:min(self.super_block.block_size, len(content))]
                self.fat.updateBitmap(add_loc, '----')
                self.super_block.free_block -= 1
                fcb.size += 1
                if len(content) > self.super_block.block_size:
                    content = content[self.super_block.block_size:]
                else:
                    content = ''
            self.updateParentSize(self.getCurFileLocation(path), fcb.size - pre_size)
        else:
            self.data[evalPro(fcb.first_block)] = content
            self.fat.updateBitmap(evalPro(fcb.first_block), '----')
            self.super_block.free_block -= 1
            self.updateParentSize(self.getCurFileLocation(path), 1)
            fcb.size = 1
        fcb.update_time = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')
        return '1'

    def saveToDisk(self):
        os.remove('disk.txt')
        with open('disk.txt', 'w+') as file:
            file.write(self.super_block.writeToDisk() + '\n')
            for i in range(0, len(self.fat.bitmap), 64):
                file.write(self.fat.bitmap[i:i + 64] + '\n')
            for i in range(0, len(self.dictionary.fcb_bitmap), 64):
                file.write(self.dictionary.fcb_bitmap[i:i + 64] + '\n')
            for f in self.dictionary.fcb_list:
                file.write(f.writeToDiskFirstLine())
                file.write(f.writeToDiskSecondLine())
            for d in self.data:
                file.write(d + '\n')
