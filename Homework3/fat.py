class FAT:
    def __init__(self, bitmap):
        self.bitmap = bitmap

    def getFirstFreeBlock(self):
        for i in range(len(self.bitmap) // 4):
            if self.bitmap[i * 4:i * 4 + 4] == '0000':
                return i
        return -1

    def updateBitmap(self, pos, content):
        content = '0'*(4-len(content))+content
        if pos * 4 + 4 == len(self.bitmap):
            self.bitmap = self.bitmap[0:pos*4]+content
        else:
            self.bitmap = self.bitmap[0:pos*4]+content+self.bitmap[pos*4+4:]

    def deleteFile(self, pos):
        if pos == '-1':
            return 0
        count = 0
        while self.bitmap[pos*4:pos*4+4] != '----':
            pos = self.bitmap[pos*4:pos*4+4]
            self.updateBitmap(pos, '0000')
            count += 1
        self.updateBitmap(pos, '0000')
        return count + 1


