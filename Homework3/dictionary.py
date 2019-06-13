class Dictionary:
    def __init__(self, fcb_bitmap, fcb_list):
        self.fcb_bitmap = fcb_bitmap
        self.fcb_list = fcb_list

    def getAndSetFirstFreeFCB(self):
        for i in range(len(self.fcb_bitmap)):
            if self.fcb_bitmap[i] == '0':
                self.updateBitmap(i,'1')
                return i
        return -1

    def updateBitmap(self, pos, value):
        if pos == len(self.fcb_bitmap) - 1:
            self.fcb_bitmap = self.fcb_bitmap[:pos] + value
        else:
            self.fcb_bitmap = self.fcb_bitmap[:pos] + value + self.fcb_bitmap[pos + 1:]
