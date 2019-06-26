search_type = 0
user = 1
user_id_name_map = {
    0: 'admin',
    1: 'user1',
    2: 'user2'
}
cur_path = 'root'
cur_type = 'folder'

init = () => {
    getCurFiles();
}

window.onunload = function () {
    $.ajax({
        url: 'save',
        type: 'POST'
    })
}

updateTitle = () => {
    var path_title = document.getElementById('path');
    path_title.innerHTML = cur_path.replace(new RegExp("_", "gm"), "/");
}

changeUser = (user_id) => {
    if (user != 0) {
        document.getElementById("write" + user.toString()).removeAttribute("style");
        document.getElementById("read" + user.toString()).removeAttribute("style");
    }
    user = user_id;
    if (user_id != 0) {
        document.getElementById("write" + user.toString()).setAttribute("style", "display: none");
        document.getElementById("read" + user.toString()).setAttribute("style", "display: none");
    }
    if (user == 0) {
        document.getElementById("user_name").innerHTML = "admin";
    } else if (user == 1) {
        document.getElementById("user_name").innerHTML = "user1";
    } else {
        document.getElementById("user_name").innerHTML = "user2";
    }
    cur_path = 'root'
    getCurFiles();
}

createFileIcon = (file_name, file_type) => {
    var div1 = document.createElement("div");
    div1.setAttribute("class", "demo-updates mdl-shadow--2dp mdl-cell mdl-cell--2-col");
    var div2 = document.createElement("div");
    div2.setAttribute("class", "mdl-card__title file_img")
    div2.setAttribute("id", file_name+'_'+file_type);
    if (file_type == 'folder') {
        div2.setAttribute("style", "background-image: url(../images/folder.png)");
    } else if (file_type == 'file') {
        div2.setAttribute("style", "background-image: url(../images/file.png)");
    }
    div1.appendChild(div2);
    var div3 = document.createElement("div");
    div3.setAttribute('class', 'mdl-card__actions mdl-card--border');
    var div4 = document.createElement("div");
    div4.setAttribute('class', 'demo-avatar-dropdown');
    var span1 = document.createElement("span");
    span1.setAttribute('class', 'mdl-layout-title');
    span1.innerHTML = file_name;
    div4.appendChild(span1);
    var div5 = document.createElement("div");
    div5.setAttribute('class', 'mdl-layout-spacer');
    div4.appendChild(div5);
    var btn1 = document.createElement("button");
    btn1.className = 'mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon';
    btn1.setAttribute('id', file_name + '_' + file_type + "_btn");
    var i1 = document.createElement("i");
    i1.setAttribute('class', 'material-icons');
    i1.innerHTML = 'more_horiz';
    btn1.appendChild(i1);
    div4.appendChild(btn1);
    var ul1 = document.createElement('ul');
    ul1.setAttribute('class', 'mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect');
    ul1.setAttribute('for', file_name + '_' + file_type + "_btn");
    var li1 = document.createElement('li');
    li1.setAttribute('class', 'mdl-menu__item');
    li1.setAttribute('id', file_name + '_' + file_type + "_info");
    var span2 = document.createElement('span');
    span2.setAttribute('class', 'mdl-list__item-primary-content');
    var i2 = document.createElement('i');
    i2.setAttribute('class', 'material-icons mdl-list__item-icon');
    i2.innerHTML = 'info';
    span2.appendChild(i2);
    span2.innerHTML += 'Info';
    li1.appendChild(span2);
    ul1.appendChild(li1);
    var li2 = document.createElement('li');
    li2.setAttribute('class', 'mdl-menu__item');
    li2.setAttribute('id', file_name + '_' + file_type + '_rename');
    var span3 = document.createElement('span');
    span3.setAttribute('class', 'mdl-list__item-primary-content');
    var i3 = document.createElement('i');
    i3.setAttribute('class', 'material-icons mdl-list__item-icon');
    i3.innerHTML = 'border_color';
    span3.appendChild(i3);
    span3.innerHTML += 'Rename';
    li2.appendChild(span3);
    ul1.appendChild(li2);
    var li3 = document.createElement('li');
    li3.setAttribute('class', 'mdl-menu__item');
    var span4 = document.createElement('span');
    span4.setAttribute('class', 'mdl-list__item-primary-content');
    var i4 = document.createElement('i');
    i4.setAttribute('class', 'material-icons mdl-list__item-icon');
    i4.innerHTML = 'delete';
    span4.appendChild(i4);
    span4.innerHTML += 'Delete';
    li3.appendChild(span4);
    li3.setAttribute('id', file_name + '_' + file_type + '_delete');
    ul1.appendChild(li3);
    var li4 = document.createElement('li');
    li4.setAttribute('class', 'mdl-menu__item');
    var span5 = document.createElement('span');
    span5.setAttribute('class', 'mdl-list__item-primary-content');
    var i5 = document.createElement('i');
    i5.setAttribute('class', 'material-icons mdl-list__item-icon');
    i5.innerHTML = 'settings';
    span5.appendChild(i5);
    span5.innerHTML += 'Right setting';
    li4.appendChild(span5);
    li4.setAttribute('id', file_name + '_' + file_type + '_setting');
    ul1.appendChild(li4);
    div4.appendChild(ul1);
    div3.appendChild(div4);
    div1.appendChild(div3);
    var main_files = document.getElementById('main_files');
    main_files.appendChild(div1);
    if (file_type == "folder") {
        $('#' + file_name + '_' + file_type).bind('click', function () {
            var name = this.id.split('_')[0];
            cur_path = cur_path + "_" + name;
            getCurFiles();
        })
    } else {
        $('#' + file_name + '_' + file_type).bind('click', function () {
            var name = this.id.split('_')[0];
            openFileContent(name);
        })
    }
    $('#' + file_name+ '_' + file_type + '_info').bind('click', function () {
        var name = this.id.split('_')[0];
        var file_type = this.id.split('_')[1];
        cur_type = file_type;
        getInfo(name);
    })
    $('#' + file_name+ '_' + file_type + '_rename').bind('click', function () {
        var name = this.id.split('_')[0];
        var file_type = this.id.split('_')[1];
        cur_type = file_type;
        showRename(name);
    })
    $('#' + file_name+ '_' + file_type + '_delete').bind('click', function () {
        var name = this.id.split('_')[0];
        var file_type = this.id.split('_')[1];
        cur_type = file_type;
        deleteFile(name);
    })
    $('#' + file_name+ '_' + file_type + '_setting').bind('click', function () {
        var name = this.id.split('_')[0];
        var file_type = this.id.split('_')[1];
        cur_type = file_type;
        rightSetting(name);
    })
}

goBack = () => {
    if (cur_path != 'root') {
        path_list = cur_path.split("_");
        cur_path = "";
        for (var i = 0; i < path_list.length - 2; i++) {
            cur_path = cur_path + path_list[i] + "_"
        }
        cur_path += path_list[path_list.length - 2];
        getCurFiles();
    }
}

getCurFiles = () => {
    console.log('GET files/' + cur_path + '/' + user_id_name_map[user])
    $.ajax({
        url: 'files/' + cur_path + '/' + user_id_name_map[user],
        type: 'GET',
        success: function (response) {
            var main_files = document.getElementById('main_files');
            while (main_files.firstChild) {
                main_files.removeChild(main_files.firstChild);
            }
            for (var i in response) {
                createFileIcon(response[i]['name'], response[i]['type']);
            }
            updateTitle();
            componentHandler.upgradeAllRegistered();
        }
    })
}

showDialog = () => {
    var create_dialog = document.getElementById("create_file");
    create_dialog.removeAttribute("style");
    create_dialog.showModal();
    document.getElementById('file_name').value = '';
    document.getElementById('type_title').innerHTML = '';
    document.getElementById('write_setting').innerHTML = '';
    document.getElementById('read_setting').innerHTML = '';
}

closeDialog = () => {
    var create_dialog = document.getElementById("create_file");
    create_dialog.close();
}

showInfo = (file_info_name, size_info, write_info, read_info, create_time_info, update_time_info,
    file_children, file_type) => {
    var info_dialog = document.getElementById("file_info_dialog");
    info_dialog.removeAttribute("style");
    document.getElementById('file_info_name').innerHTML = file_info_name;
    document.getElementById('size_info').innerHTML = size_info;
    document.getElementById('write_info').innerHTML = write_info;
    document.getElementById('read_info').innerHTML = read_info;
    document.getElementById('create_time_info').innerHTML = create_time_info;
    document.getElementById('update_time_info').innerHTML = update_time_info;
    if (file_type == 'folder') {
        document.getElementById('file_children').removeAttribute('style');
        document.getElementById('file_children_title').removeAttribute('style');
        document.getElementById('file_children').innerHTML = file_children;
        document.getElementById('file_type').setAttribute('style', 'display: none');
        document.getElementById('file_type_title').setAttribute('style', 'display: none');
    } else {
        document.getElementById('file_type').removeAttribute('style');
        document.getElementById('file_type_title').removeAttribute('style');
        document.getElementById('file_type').innerHTML = file_type;
        document.getElementById('file_children').setAttribute('style', 'display: none');
        document.getElementById('file_children_title').setAttribute('style', 'display: none');
    }
    info_dialog.showModal();
}

closeInfo = () => {
    var info_dialog = document.getElementById("file_info_dialog");
    info_dialog.close();
}

addUserWriteRight = (user_id) => {
    var write_setting = document.getElementById('write_setting');
    if (write_setting.innerHTML.indexOf(user_id_name_map[user_id]) == -1) {
        write_setting.innerHTML += user_id_name_map[user_id];
    } else {
        var setting = write_setting.innerHTML
        write_setting.innerHTML = setting.replace(user_id_name_map[user_id], '');
    }
}

addUserReadRight = (user_id) => {
    var read_setting = document.getElementById('read_setting');
    if (read_setting.innerHTML.indexOf(user_id_name_map[user_id]) == -1) {
        read_setting.innerHTML += user_id_name_map[user_id];
    } else {
        var setting = read_setting.innerHTML
        read_setting.innerHTML = setting.replace(user_id_name_map[user_id], '');
    }
}

showSnackBar = (content) => {
    window['counter'] = 0;
    var snackbarContainer = document.getElementById('message_snackbar');
    var data = { message: content };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

changeType = (type_id) => {
    if (type_id == 0) {
        document.getElementById('type_title').innerHTML = 'file';
    } else {
        document.getElementById('type_title').innerHTML = 'folder';
    }
}

createFile = () => {
    var text = document.getElementById('file_name').value;
    if (user == 0) {
        var write_user = "admin_" + document.getElementById('write_setting').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
        var read_user = "admin_" + document.getElementById('read_setting').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
    } else if (user == 1) {
        var write_user = "admin_user1_" + document.getElementById('write_setting').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
        var read_user = "admin_user1_" + document.getElementById('read_setting').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
    } else if (user == 2) {
        var write_user = "admin_user2_" + document.getElementById('write_setting').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
        var read_user = "admin_user2_" + document.getElementById('read_setting').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
    }
    var file_type = document.getElementById('type_title').innerHTML;
    if (file_type == '') {
        showSnackBar("文件类型不能为空！");
        return;
    }
    if (text == '') {
        showSnackBar("文件名不能为空！");
        return;
    } else if (text.length > 10) {
        showSnackBar("文件名过长！");
        return;
    }
    console.log('POST files/' + cur_path + "/" + text + "/" + file_type + "/" + write_user + "/" + read_user);
    if (text) {
        $.ajax({
            url: 'files/' + cur_path + "/" + text + "/" + file_type + "/" + write_user + "/" + read_user,
            type: 'POST',
            success: function (response) {
                if (response == "1") {
                    showSnackBar("创建成功！");
                    closeDialog();
                    getCurFiles();
                } else if (response == '-1') {
                    showSnackBar("文件名重复！");
                } else {
                    showSnackBar("空间不足！");
                }
            }
        })
    }
}

getInfo = (file_name) => {
    console.log('GET file_info/' + cur_path + "_" + file_name + "/" + cur_type);
    $.ajax({
        url: 'file_info/' + cur_path + "_" + file_name + "/" + cur_type,
        type: 'GET',
        success: function (response) {
            showInfo(response['name'], response['size'], response['write_user'],
                response['read_user'], response['create_time'], response['update_time'],
                response['child_len'], response['type']);
        }
    })
}

showRename = (file_name) => {
    var rename_dialog = document.getElementById("rename_dialog");
    rename_dialog.removeAttribute("style");
    rename_dialog.showModal();
    document.getElementById('rename_name').value = file_name;
    document.getElementById('origin_name').innerHTML = file_name;
}

closeRename = () => {
    var rename_dialog = document.getElementById("rename_dialog");
    rename_dialog.close();
}

changeName = () => {
    var rename_name = document.getElementById('rename_name').value;
    var origin_name = document.getElementById('origin_name').innerHTML;
    if (rename_name != origin_name) {
        console.log('POST', 'rename/' + cur_path + "_" + origin_name + "/" + rename_name + "/" + user_id_name_map[user] + "/" + cur_type);
        $.ajax({
            url: 'rename/' + cur_path + "_" + origin_name + "/" + rename_name + "/" + user_id_name_map[user] + "/" + cur_type,
            type: 'POST',
            success: function (response) {
                if (response == "1") {
                    showSnackBar('修改成功！');
                    closeRename();
                    getCurFiles();
                } else if (response == "-1") {
                    showSnackBar('文件名重复！');
                } else if (response == "-2") {
                    showSnackBar('无权限！');
                    closeRename();
                }
            }
        })
    } else {
        closeRename();
    }
}

deleteFile = (file_name) => {
    console.log('DELETE delete/' + cur_path + '_' + file_name + '/' + user_id_name_map[user] + "/" + cur_type);
    $.ajax({
        url: 'delete/' + cur_path + '_' + file_name + '/' + user_id_name_map[user] + "/" + cur_type,
        type: 'DELETE',
        success: function (response) {
            if (response == '1') {
                showSnackBar('删除成功！');
                getCurFiles();
            } else if (response == '-1') {
                showSnackBar('无权限！');
            }
        }
    })
}

showSetting = () => {
    var setting_dialog = document.getElementById("setting_dialog");
    setting_dialog.removeAttribute("style");
    setting_dialog.showModal();
}

closeSetting = () => {
    var setting_dialog = document.getElementById("setting_dialog");
    setting_dialog.close();
}

rightSetting = (file_name) => {
    console.log('GET file_right/' + cur_path + "_" + file_name + "/" + user_id_name_map[user] + "/" + cur_type);
    $.ajax({
        url: 'file_right/' + cur_path + "_" + file_name + "/" + user_id_name_map[user] + "/" + cur_type,
        type: 'GET',
        success: function (response) {
            if (response['state'] == 1) {
                document.getElementById('write_user').innerHTML = response['write_user'];
                document.getElementById('read_user').innerHTML = response['read_user'];
                document.getElementById('setting_title').innerHTML = response['name'];
                showSetting();
            } else {
                showSnackBar('无权限！');
            }
        }
    })
}

reverseWriteRight = (user_id) => {
    var context = document.getElementById('write_user').innerHTML;
    if (user_id == 1) {
        if (context.indexOf('user1') != -1) {
            document.getElementById('write_user').innerHTML = document.getElementById('write_user').innerHTML.replace('user1', '');
        } else {
            document.getElementById('write_user').innerHTML += " user1";
        }
    } else if (user_id == 2) {
        if (context.indexOf('user2') != -1) {
            document.getElementById('write_user').innerHTML = document.getElementById('write_user').innerHTML.replace('user2', '');
        } else {
            document.getElementById('write_user').innerHTML += " user2";
        }
    }
}

reverseReadRight = (user_id) => {
    var context = document.getElementById('read_user').innerHTML;
    if (user_id == 1) {
        if (context.indexOf('user1') != -1) {
            document.getElementById('read_user').innerHTML = document.getElementById('read_user').innerHTML.replace('user1', "");
        } else {
            document.getElementById('read_user').innerHTML += " user1";
        }
    } else if (user_id == 2) {
        if (context.indexOf('user2') != -1) {
            document.getElementById('read_user').innerHTML = document.getElementById('read_user').innerHTML.replace('user2', "");
        } else {
            document.getElementById('read_user').innerHTML += " user2";
        }
    }
}

updateRightSetting = () => {
    var file_name = document.getElementById('setting_title').innerHTML;
    var new_write_user = document.getElementById('write_user').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
    var new_read_user = document.getElementById('read_user').innerHTML.replace(new RegExp("\\s+", "gm"), "_");
    console.log('POST setting/' + cur_path + "_" + file_name + "/" + new_write_user + "/" + new_read_user + '/' + user_id_name_map[user] + '/' + cur_type);
    $.ajax({
        url: 'setting/' + cur_path + "_" + file_name + "/" + new_write_user + "/" + new_read_user + '/' + user_id_name_map[user] + '/' + cur_type,
        type: 'POST',
        success: function (response) {
            if (response == 1) {
                showSnackBar('更新成功！');
                closeSetting();
                getCurFiles();
            } else {
                showSnackBar('无权限！');
            }
        }
    })
}

showContent = () => {
    document.getElementById("content_dialog").removeAttribute("style");
    content_dialog.showModal();
}

closeContent = () => {
    var content_dialog = document.getElementById("content_dialog");
    content_dialog.close();
}

openFileContent = (file_name) => {
    console.log('GET ' + 'content/' + cur_path + '_' + file_name + "/" + user_id_name_map[user]);
    document.getElementById('file_title').innerHTML = file_name;
    $.ajax({
        url: 'content/' + cur_path + '_' + file_name + "/" + user_id_name_map[user],
        type: 'GET',
        success: function (response) {
            if (response['state'] == 2) {
                document.getElementById('file_content').removeAttribute('style');
                document.getElementById('save_content_btn').removeAttribute('style');
                document.getElementById('file_content').value = response['content'];
                document.getElementById('read_mode_content').innerHTML = ''
                showContent();
            } else {
                document.getElementById('read_mode_content').innerHTML = response['content'];
                document.getElementById('file_content').setAttribute('style', 'display: none');
                document.getElementById('save_content_btn').setAttribute('style', 'display: none');
                showContent();
            }
        }
    })
}

saveContent = () => {
    var file_name = document.getElementById('file_title').innerHTML;
    var content = document.getElementById('file_content').value;
    console.log('UPDATE content/' + cur_path + '_' + file_name + '/' + content + '/' + user_id_name_map[user])
    $.ajax({
        url: 'content/' + cur_path + '_' + file_name + '/' + content + '/' + user_id_name_map[user],
        type: 'UPDATE',
        success: function (response) {
            if (response == '1') {
                showSnackBar('保存成功！');
                closeContent();
            } else if (response == '-2') {
                showSnackBar('空间已满！');
                closeContent();
            } else {
                showSnackBar('保存失败！');
                closeContent();
            }
            getCurFiles();
        }
    })
}

reformat = () => {
    console.log('POST reformat');
    if (user != 0) {
        showSnackBar('无权限！');
        return;
    }
    $.ajax({
        url: 'reformat',
        type: 'POST',
        success: function (response) {
            if (response == '1') {
                window.location.reload();
            }
        }
    })
}
