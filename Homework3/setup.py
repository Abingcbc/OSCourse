import os
import datetime


def init():
    if not os.path.exists("./disk.txt"):
        with open("disk.txt", "w+") as file:
            file.write("2048 128 2047 509\n")
            # block bitmap & fat
            # Each block occupy 4 bits
            # First 4 bits are set specially
            file.write("----000000000000000000000000000000000000000000000000000000000000\n")
            for i in range(127):
                file.write("0000000000000000000000000000000000000000000000000000000000000000\n")
            # dictionary bitmap
            file.write("1110000000000000000000000000000000000000000000000000000000000000\n")
            for i in range(3):
                file.write("0000000000000000000000000000000000000000000000000000000000000000\n")
            # name file_type pos create_time update_time
            # size first_block write_user read_user delete_able is_able
            file.write("root folder -1 " + str(
                datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')) + " " + str(
                datetime.datetime.strftime(datetime.datetime.now(),
                                           '%Y-%m-%d-%X')) + "\n0 -1 admin_user1_user2 admin_user1_user2 -1 1\n")
            file.write("home folder 0 " + str(
                datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')) + " " + str(
                datetime.datetime.strftime(datetime.datetime.now(),
                                           '%Y-%m-%d-%X')) + "\n0 -1 admin admin_user1 -1 1\n")
            file.write("trash folder 0 " + str(
                datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')) + " " + str(
                datetime.datetime.strftime(datetime.datetime.now(),
                                           '%Y-%m-%d-%X')) + "\n0 -1 admin admin_user1_user2 -1 1\n")
            for i in range(510):
                file.write("-1\n")
                file.write("-1\n")
            for i in range(2048):
                file.write("-1\n")
