from flask import Flask, jsonify
from file_system import FileSystem
import datetime

app = Flask(__name__, static_url_path='')

file_system = FileSystem()


@app.route('/files/<path>/<name>/<file_type>/<writer_user>/<read_user>', methods=['POST'])
def createFile(path, name, file_type, writer_user, read_user):
    read_user = '_'.join(set(writer_user.split('_') + read_user.split('_')))
    return str(file_system.createFile(path, name, file_type, writer_user, read_user))


@app.route('/files/<path>/<user>', methods=['GET'])
def getCurFiles(path, user):
    fcb_list = file_system.getFileChildren(path)
    result = {}
    for index, fcb in enumerate(fcb_list):
        if file_system.dictionary.fcb_list[fcb].checkReadRight(user):
            result[index] = {
                'name': file_system.dictionary.fcb_list[fcb].name,
                'type': file_system.dictionary.fcb_list[fcb].type
            }
    return jsonify(result)


@app.route('/file_right/<path>/<user>/<file_type>', methods=['GET'])
def getFileRight(path, user, file_type):
    fcb = file_system.getCurFile(path, file_type)
    if fcb.checkWriteRight(user):
        return jsonify({
            'state': 1,
            'name': fcb.name,
            'write_user': fcb.write_user.replace("_", " "),
            'read_user': fcb.read_user.replace("_", " ")
        })
    else:
        return jsonify({
            'state': -1
        })


@app.route('/file_info/<path>/<file_type>', methods=['GET'])
def getFileInfo(path, file_type):
    fcb = file_system.getCurFile(path, file_type)
    result = {
        'name': fcb.name,
        'type': fcb.type,
        'create_time': fcb.creat_time,
        'update_time': fcb.update_time,
        'size': fcb.size,
        'write_user': fcb.write_user.replace("_", " "),
        'read_user': fcb.read_user.replace("_", " "),
        'child_len': len(fcb.child_list)
    }
    return jsonify(result)


@app.route('/rename/<path>/<new_name>/<user>/<file_type>', methods=['POST'])
def renameFile(path, new_name, user, file_type):
    parent_path = "_".join(path.split("_")[0:-1])
    parent = file_system.getCurFile(parent_path, 'folder')
    if not file_system.getCurFile(path, file_type).checkWriteRight(user):
        return "-2"
    for child in parent.child_list:
        if file_system.dictionary.fcb_list[child].name == new_name and file_system.getCurFile(path, file_type).type == \
                file_system.dictionary.fcb_list[child].type:
            return "-1"
    file_system.getCurFile(path, file_type).name = new_name
    file_system.getCurFile(path, file_type).update_time = datetime.datetime.strftime(datetime.datetime.now(),
                                                                                     '%Y-%m-%d-%X')
    return "1"


@app.route('/delete/<path>/<user>/<file_type>', methods=['DELETE'])
def deleteFile(path, user, file_type):
    return file_system.deleteFile(path, user, file_type)


@app.route('/setting/<path>/<new_write_users>/<new_read_users>/<user>/<file_type>', methods=['POST'])
def updateRightSetting(path, new_write_users, new_read_users, user, file_type):
    fcb = file_system.getCurFile(path, file_type)
    fcb.update_time = datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d-%X')
    if fcb.checkWriteRight(user):
        fcb.write_user = new_write_users
        fcb.read_user = '_'.join(set(new_read_users.split('_') + new_write_users.split('_')))
        return "1"
    else:
        return "-1"


@app.route('/content/<path>/<user>', methods=['GET'])
def getFileContent(path, user):
    return jsonify(file_system.openFileContent(path, user))


@app.route('/content/<path>/<content>/<user>', methods=['UPDATE'])
def updateFileContent(path, content, user):
    return file_system.updateFileContent(path, content, user)


@app.route('/save', methods=['POST'])
def saveToDisk():
    file_system.saveToDisk()
    return '1'


@app.route('/reformat', methods=['POST'])
def reformat():
    file_system.reformat()
    return '1'


@app.route('/')
def main():
    return app.send_static_file("html/index.html")


if __name__ == '__main__':
    app.run()
