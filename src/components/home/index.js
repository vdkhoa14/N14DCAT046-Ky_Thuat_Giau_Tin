import React from 'react'
import { Route, Switch } from 'react-router'
import './style.css'
import $ from 'jquery'
class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isSignedIn: false,
            appData: [],
            userName: "vd_khoa",
            isLogin: false,
            password: "123456",
            acctive_tab: 0,
            adminFiles: [],
            customerFiles: [],
            processing: false,
            showPopup: false,
            file: null,
            isUploading: false,
            showPopupDelete: false,
            isDeleting: false,
            currentFile: null,
            deleteSuccess: false,
            showPopupBuy: false,
            buySuccess: false,
            isBuying: false
        }

    }

    componentDidMount() {
        this.setState({
            appData: window.appData
        })
    }

    login(callback) {
        $(".login_notify").text("");
        let {
            userName,
            password
        } = this.state;
        if (userName === "" || password === "") {
            $(".login_notify").text("Vui lòng nhập đầy đủ thông tin.");
        }
        else {
            if (userName === "admin") {
                if (password === "admin") {
                    window.retrieveAllFilesInFolder("1_jIaRRo0F83cOVeGW3w01q3mcRNnPQY0", (result) => {
                        let files = [];
                        result.map((item, i) => {
                            window.printFile(item.id, (resp) => {
                                files.push(resp)
                            })
                        })
                        this.setState({
                            isLogin: true,
                            adminFiles: files
                        })
                    })
                } else {
                    $(".login_notify").text("Tài khoản hoặc mật khẩu không chính xác.");
                }
            }
            else {
                if (userName === "vd_khoa") {
                    if (password === "123456") {
                        window.retrieveAllFilesInFolder("1_jIaRRo0F83cOVeGW3w01q3mcRNnPQY0", (result) => {
                            let files = [];
                            result.map((item, i) => {
                                window.printFile(item.id, (resp) => {
                                    files.push(resp)
                                })
                            })
                            this.setState({
                                isLogin: true,
                                adminFiles: files
                            })
                        })
                        window.retrieveAllFilesInFolder("19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY", (result) => {
                            let files = [];
                            result.map((item, i) => {
                                this.checkLicense(item.id, (resp) => {
                                    if (resp) {
                                        window.printFile(item.id, (resp) => {
                                            resp.allowDownload = true;
                                            files.push(resp)
                                        })
                                    }
                                    else {
                                        window.printFile(item.id, (resp) => {
                                            resp.allowDownload = false;
                                            files.push(resp)
                                        })
                                    }
                                })

                            })
                            this.setState({
                                isLogin: true,
                                customerFiles: files
                            })
                        })
                    } else {
                        $(".login_notify").text("Tài khoản hoặc mật khẩu không chính xác.");
                    }
                }
                else {
                    $(".login_notify").text("Tài khoản không tồn tại.");
                }
            }
        }
        setTimeout(() => {
            callback();
        }, 4000);
    }

    handleResetMusic(e) {
        var list = document.getElementsByClassName("music_item");
        $(e.target).parent().parent().find(".content_left > img").addClass("active");
        for (var i = 0; i < list.length; i++) {
            if (e.target != list[i]) {
                list[i].pause();
                $(list[i]).parent().parent().find(".content_left > img").removeClass("active");
            }
        }
    }
    handlePauseMusic(e){
        $(e.target).parent().parent().find(".content_left > img").removeClass("active");
    }

    uploadToDrive(folderId, fileData, callback) {

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var reader = new FileReader();
        reader.readAsBinaryString(fileData);
        reader.onload = function (e) {
            var contentType = fileData.type || 'application/octet-stream';
            var metadata = {
                'title': fileData.name,
                'mimeType': contentType,
                'parents': [{ id: folderId }]
            };

            var base64Data = btoa(reader.result);
            var multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

            var request = window.gapi.client.request({
                'path': '/upload/drive/v2/files/',
                'method': 'POST',
                'params': { 'uploadType': 'multipart' },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });

            request.execute((uploadResponse) => {
                callback(uploadResponse)
            })
        }
    }




    fetchFiles(folderId, callback) {
        window.retrieveAllFilesInFolder(folderId, (result) => {
            if (folderId === "1_jIaRRo0F83cOVeGW3w01q3mcRNnPQY0") {
                let files = [];
                result.map((item, i) => {
                    window.printFile(item.id, (resp) => {
                        files.push(resp)
                    })
                })
                this.setState({
                    isLogin: true,
                    adminFiles: files
                }, () => {
                    callback();
                })
            }
            else if (folderId === "19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY") {
                let files = [];
                result.map((item, i) => {
                    this.checkLicense(item.id, (resp) => {
                        if (resp) {
                            window.printFile(item.id, (resp) => {
                                resp.allowDownload = true;
                                files.push(resp)
                            })
                        }
                        else {
                            window.printFile(item.id, (resp) => {
                                resp.allowDownload = false;
                                files.push(resp)
                            })
                        }
                    })
                })
                this.setState({
                    isLogin: true,
                    customerFiles: files
                }, () => {
                    callback();
                })
            }
        })
    }

    handleUpload() {
        this.setState({
            isUploading: true
        })
        const that = this;
        let {
            userName,
            password
        } = this.state

        var fileData = this.state.file

        if (userName === "admin") {
            if (password === "admin") {
                that.uploadToDrive("1_jIaRRo0F83cOVeGW3w01q3mcRNnPQY0", fileData, (result) => {
                    that.fetchFiles("1_jIaRRo0F83cOVeGW3w01q3mcRNnPQY0", () => {
                        this.setState({
                            isUploading: false
                        })
                    });
                })
            }
        }
        else {
            if (userName === "vd_khoa") {
                if (password === "123456") {
                    that.uploadToDrive("19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY", fileData, (result) => {
                        that.fetchFiles("19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY")
                        this.setState({
                            isUploading: false
                        })
                    })
                }
            }

        }

    }

    handleDelete() {
        var that = this;
        this.setState({
            isDeleting: true
        })
        let {
            userName,
            password
        } = this.state
        window.deleteFile(this.state.currentFile.id, () => {
            if (userName === "admin") {
                if (password === "admin") {
                    that.fetchFiles("1_jIaRRo0F83cOVeGW3w01q3mcRNnPQY0", () => {
                        this.setState({
                            isDeleting: false,
                            deleteSuccess: true
                        })
                    });
                }
            }
            else {
                if (userName === "vd_khoa") {
                    if (password === "123456") {
                        that.fetchFiles("19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY", () => {
                            this.setState({
                                isDeleting: false,
                                deleteSuccess: true
                            })
                        });
                    }
                }

            }
        });
    }

    customUploadToDrive(folderId, fileData, fileName, fileType, callback) {

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var reader = new FileReader();
        var contentType = fileType || 'application/octet-stream';
        var metadata = {
            'title': fileName,
            'mimeType': contentType,
            'parents': [{ id: folderId }]
        };

        var base64Data = fileData;
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        var request = window.gapi.client.request({
            'path': '/upload/drive/v2/files/',
            'method': 'POST',
            'params': { 'uploadType': 'multipart' },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });

        request.execute((uploadResponse) => {
            callback(uploadResponse)
        })
    }

    handlBuy() {
        var that = this;
        var currentFile = this.state.currentFile;
        window.downloadFile(this.state.currentFile.id, (result) => {

            this.encode(result, "vd_khoa", (array) => {
                var newArray = new Uint8Array(array);
                var base64 = btoa(
                    new Uint8Array(newArray)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                that.customUploadToDrive("19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY", base64, currentFile.title, currentFile.mimeType, () => {
                    this.fetchFiles("19YcwNsz0_nm5TVbUuRhjwy6EWfweudQY", () => {
                        this.setState({
                            isBuying: false,
                            buySuccess: true
                        })
                    });
                })
            });
        })
    }

    decToBin(dec) {
        var bin = (dec >>> 0).toString(2);
        var newBin = ""
        for (var i = 0; i < 8 - bin.length; i++) {
            newBin += "0";
        }
        return newBin + bin;
    }



    encode(buffer, string, callback) {
        var currentByte = 44;
        var array = new Uint8Array(buffer);


        var string_lenght_bin = this.decToBin(string.length);
        for (var i = 0; i < string_lenght_bin.length; i++) {
            var temp = this.decToBin(array[currentByte]);
            temp = temp.substr(0, 7) + string_lenght_bin[i];
            var digit = parseInt(temp, 2);
            array[currentByte] = digit;
            currentByte++;
        }


        var resultArray = [];

        for (var i = 0; i < string.length; i++) {
            resultArray.push(this.decToBin(string.charCodeAt(i)))
        }
        var messBin = resultArray.join("");
        for (var i = 0; i < messBin.length; i++) {
            var temp = this.decToBin(array[currentByte]);
            temp = temp.substr(0, 7) + messBin[i];
            var digit = parseInt(temp, 2);
            array[currentByte] = digit;
            currentByte++;
        }

        callback(array);
    }



    decode(array, string, callback) {
        var currentByte = 44;


        var cipherTextLengthBin = "";


        for (var i = 0; i < 8; i++) {
            cipherTextLengthBin += this.decToBin(array[currentByte]).substr(7, 8);
            currentByte++;
        }

        var cipherTextLengthDec = parseInt(cipherTextLengthBin, 2);

        var planText = ""

        while (currentByte < 52 + (8 * cipherTextLengthDec)) {
            var temp = "";
            for (var i = 0; i < 8; i++) {
                temp += this.decToBin(array[currentByte + i]).substr(7, 8);
            }
            planText += String.fromCharCode(parseInt(temp, 2));
            currentByte += 8;
        }
        callback(planText === string);
    }


    checkLicense(fileId, callback) {
        var that = this;
        window.downloadFile(fileId, (result) => {
            var array = new Uint8Array(result);
            this.decode(array, this.state.userName, (resp) => {
                console.log(resp)
                callback(resp)
            })
        })
    }

    render() {
        let {
            userName,
            isLogin,
            password,
            acctive_tab,
            adminFiles,
            customerFiles,
            processing,
            showPopup,
            isUploading,
            showPopupDelete,
            isDeleting,
            currentFile,
            deleteSuccess,
            showPopupBuy,
            buySuccess,
            isBuying
        } = this.state;


        return (
            < div className="home-page" >
                {
                    (isLogin) ? <div className="content">
                        {
                            (userName === "admin" && userName != "") ? < div className="addmin">
                                <div className="header">
                                    <div className="main_menu">
                                        <span className={(acctive_tab === 1) ? "active" : ""} onClick={() => this.setState({ acctive_tab: 1 })}>Danh sách nhạc</span>
                                        <span className={(acctive_tab === 2) ? "active" : ""} onClick={() => this.setState({ acctive_tab: 2 })}>Danh sách người dùng</span>
                                    </div>
                                    <div className="user_menu">

                                        <span className="user_name">{userName}</span>
                                        <span className="log_out" onClick={() => this.setState({ isLogin: false, processing: false, acctive_tab: 0 })}>Đăng xuất</span>
                                    </div>
                                </div>
                                <div className="contain">
                                    {
                                        (acctive_tab > 0) ? <div>
                                            {
                                                (acctive_tab === 1) ? <div className="tab_1">
                                                    {
                                                        <div className="toolbar">
                                                            <i className="fa fa-plus" onClick={() => this.setState({ showPopup: true })}></i>
                                                        </div>
                                                    }
                                                    <div className="music_box">
                                                        {
                                                            (adminFiles) ? adminFiles.map((item, i) =>
                                                                <div className="music_content" key={i}>
                                                                    <div className="content_left">
                                                                        <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIHN0eWxlPSJmaWxsOiM0MjRBNjA7IiBkPSJNNDcuNzk5LDguMjAxYy0xMC45MzUtMTAuOTM1LTI4LjY2My0xMC45MzUtMzkuNTk4LDBjLTEwLjkzNSwxMC45MzUtMTAuOTM1LDI4LjY2MywwLDM5LjU5OCAgYzEwLjkzNSwxMC45MzUsMjguNjYzLDEwLjkzNSwzOS41OTgsMEM1OC43MzQsMzYuODY0LDU4LjczNCwxOS4xMzYsNDcuNzk5LDguMjAxeiBNMzIuOTUsMzIuOTVjLTIuNzM0LDIuNzM0LTcuMTY2LDIuNzM0LTkuODk5LDAgIGMtMi43MzQtMi43MzQtMi43MzQtNy4xNjYsMC05Ljg5OXM3LjE2Ni0yLjczNCw5Ljg5OSwwUzM1LjY4MywzMC4yMTYsMzIuOTUsMzIuOTV6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNFN0VDRUQ7IiBkPSJNMzUuNzc4LDIwLjIyMmMtNC4yOTYtNC4yOTYtMTEuMjYxLTQuMjk2LTE1LjU1NiwwYy00LjI5Niw0LjI5Ni00LjI5NiwxMS4yNjEsMCwxNS41NTYgIGM0LjI5Niw0LjI5NiwxMS4yNjEsNC4yOTYsMTUuNTU2LDBDNDAuMDc0LDMxLjQ4Miw0MC4wNzQsMjQuNTE4LDM1Ljc3OCwyMC4yMjJ6IE0zMC4xMjEsMzAuMTIxYy0xLjE3MiwxLjE3Mi0zLjA3MSwxLjE3Mi00LjI0MywwICBzLTEuMTcyLTMuMDcxLDAtNC4yNDNzMy4wNzEtMS4xNzIsNC4yNDMsMFMzMS4yOTMsMjguOTUsMzAuMTIxLDMwLjEyMXoiLz4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNzM4M0JGOyIgZD0iTTM1Ljc3OCwzNS43NzhjLTAuNzYsMC43Ni0xLjYwNywxLjM3OC0yLjUwNCwxLjg3bDguMTU3LDE0LjkyYzIuMjg0LTEuMjUsNC40MzQtMi44MzUsNi4zNjgtNC43NjkgICBjMS45MzQtMS45MzQsMy41MTktNC4wODQsNC43NjktNi4zNjhsLTE0LjkyLTguMTU3QzM3LjE1NywzNC4xNzIsMzYuNTM4LDM1LjAxOCwzNS43NzgsMzUuNzc4eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzczODNCRjsiIGQ9Ik0yMC4yMjIsMjAuMjIyYzAuNzYtMC43NiwxLjYwNy0xLjM3OCwyLjUwNC0xLjg3bC04LjE1Ny0xNC45MmMtMi4yODQsMS4yNS00LjQzNCwyLjgzNS02LjM2OCw0Ljc2OSAgIHMtMy41MTksNC4wODQtNC43NjksNi4zNjhsMTQuOTIsOC4xNTdDMTguODQzLDIxLjgyOCwxOS40NjIsMjAuOTgyLDIwLjIyMiwyMC4yMjJ6Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />

                                                                    </div>
                                                                    <div className="content_right">
                                                                        <span>{item.title}</span>
                                                                        <audio className="music_item" controls onPlay={(e) => this.handleResetMusic(e)} controlsList="nodownload">
                                                                            <source src={"https://docs.google.com/uc?export=open&id=" + item.id} type="audio/mp3"></source>
                                                                        </audio>
                                                                        <i className="fa fa-trash" onClick={() => {
                                                                            this.setState({
                                                                                currentFile: { id: item.id, title: item.title },
                                                                                showPopupDelete: true
                                                                            })
                                                                        }}></i>
                                                                    </div>
                                                                </div>
                                                            ) : ""
                                                        }

                                                    </div>
                                                </div> : <div className="tab_2">
                                                        tab_2
                                            </div>
                                            }
                                        </div> : <div id="loading"></div>
                                    }
                                </div>
                            </div> : <div className="customer">
                                    <div className="header">
                                        <div className="main_menu">
                                            <span className={(acctive_tab === 1) ? "active" : ""} onClick={() => this.setState({ acctive_tab: 1 })}>Nhạc online</span>
                                            <span className={(acctive_tab === 2) ? "active" : ""} onClick={() => this.setState({ acctive_tab: 2 })}>Nhạc của tôi</span>
                                        </div>
                                        <div className="user_menu">
                                            <span className="user_name">{userName}</span>
                                            <span className="log_out" id="bt_log_out" onClick={() => {
                                                this.setState({ isLogin: false, acctive_tab: 0 });
                                            }}>Đăng xuất</span>
                                        </div>
                                    </div>
                                    <div className="contain">
                                        {
                                            (acctive_tab > 0) ? <div>
                                                {
                                                    (acctive_tab === 1) ? <div className="tab_1">
                                                        <div className="music_box">
                                                            {
                                                                (adminFiles) ? adminFiles.map((item, i) =>
                                                                    <div className="music_content" key={i} id={item.id}>
                                                                        <div className="content_left">
                                                                            <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIHN0eWxlPSJmaWxsOiM0MjRBNjA7IiBkPSJNNDcuNzk5LDguMjAxYy0xMC45MzUtMTAuOTM1LTI4LjY2My0xMC45MzUtMzkuNTk4LDBjLTEwLjkzNSwxMC45MzUtMTAuOTM1LDI4LjY2MywwLDM5LjU5OCAgYzEwLjkzNSwxMC45MzUsMjguNjYzLDEwLjkzNSwzOS41OTgsMEM1OC43MzQsMzYuODY0LDU4LjczNCwxOS4xMzYsNDcuNzk5LDguMjAxeiBNMzIuOTUsMzIuOTVjLTIuNzM0LDIuNzM0LTcuMTY2LDIuNzM0LTkuODk5LDAgIGMtMi43MzQtMi43MzQtMi43MzQtNy4xNjYsMC05Ljg5OXM3LjE2Ni0yLjczNCw5Ljg5OSwwUzM1LjY4MywzMC4yMTYsMzIuOTUsMzIuOTV6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNFN0VDRUQ7IiBkPSJNMzUuNzc4LDIwLjIyMmMtNC4yOTYtNC4yOTYtMTEuMjYxLTQuMjk2LTE1LjU1NiwwYy00LjI5Niw0LjI5Ni00LjI5NiwxMS4yNjEsMCwxNS41NTYgIGM0LjI5Niw0LjI5NiwxMS4yNjEsNC4yOTYsMTUuNTU2LDBDNDAuMDc0LDMxLjQ4Miw0MC4wNzQsMjQuNTE4LDM1Ljc3OCwyMC4yMjJ6IE0zMC4xMjEsMzAuMTIxYy0xLjE3MiwxLjE3Mi0zLjA3MSwxLjE3Mi00LjI0MywwICBzLTEuMTcyLTMuMDcxLDAtNC4yNDNzMy4wNzEtMS4xNzIsNC4yNDMsMFMzMS4yOTMsMjguOTUsMzAuMTIxLDMwLjEyMXoiLz4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNzM4M0JGOyIgZD0iTTM1Ljc3OCwzNS43NzhjLTAuNzYsMC43Ni0xLjYwNywxLjM3OC0yLjUwNCwxLjg3bDguMTU3LDE0LjkyYzIuMjg0LTEuMjUsNC40MzQtMi44MzUsNi4zNjgtNC43NjkgICBjMS45MzQtMS45MzQsMy41MTktNC4wODQsNC43NjktNi4zNjhsLTE0LjkyLTguMTU3QzM3LjE1NywzNC4xNzIsMzYuNTM4LDM1LjAxOCwzNS43NzgsMzUuNzc4eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzczODNCRjsiIGQ9Ik0yMC4yMjIsMjAuMjIyYzAuNzYtMC43NiwxLjYwNy0xLjM3OCwyLjUwNC0xLjg3bC04LjE1Ny0xNC45MmMtMi4yODQsMS4yNS00LjQzNCwyLjgzNS02LjM2OCw0Ljc2OSAgIHMtMy41MTksNC4wODQtNC43NjksNi4zNjhsMTQuOTIsOC4xNTdDMTguODQzLDIxLjgyOCwxOS40NjIsMjAuOTgyLDIwLjIyMiwyMC4yMjJ6Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
                                                                        </div>
                                                                        <div className="content_right">
                                                                            <span>{item.title}</span>
                                                                            <audio className="music_item" controls onPlay={(e) => this.handleResetMusic(e)} onPause={(e) => this.handlePauseMusic(e)} controlsList="nodownload">
                                                                                <source src={"https://docs.google.com/uc?export=open&id=" + item.id} type="audio/mp3"></source>
                                                                            </audio>
                                                                            <span className="bt_buy" onClick={() => {
                                                                                this.setState({
                                                                                    currentFile: { id: item.id, title: item.title },
                                                                                    showPopupBuy: true
                                                                                })
                                                                            }}>Mua</span>
                                                                        </div>
                                                                    </div>
                                                                ) : ""
                                                            }

                                                        </div>
                                                    </div> : <div className="tab_2">
                                                            <div className="music_box">
                                                                {
                                                                    (customerFiles) ? customerFiles.map((item, i) =>
                                                                        <div className="music_content" key={i}>
                                                                            <div className="content_left">
                                                                                <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIHN0eWxlPSJmaWxsOiM0MjRBNjA7IiBkPSJNNDcuNzk5LDguMjAxYy0xMC45MzUtMTAuOTM1LTI4LjY2My0xMC45MzUtMzkuNTk4LDBjLTEwLjkzNSwxMC45MzUtMTAuOTM1LDI4LjY2MywwLDM5LjU5OCAgYzEwLjkzNSwxMC45MzUsMjguNjYzLDEwLjkzNSwzOS41OTgsMEM1OC43MzQsMzYuODY0LDU4LjczNCwxOS4xMzYsNDcuNzk5LDguMjAxeiBNMzIuOTUsMzIuOTVjLTIuNzM0LDIuNzM0LTcuMTY2LDIuNzM0LTkuODk5LDAgIGMtMi43MzQtMi43MzQtMi43MzQtNy4xNjYsMC05Ljg5OXM3LjE2Ni0yLjczNCw5Ljg5OSwwUzM1LjY4MywzMC4yMTYsMzIuOTUsMzIuOTV6Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiNFN0VDRUQ7IiBkPSJNMzUuNzc4LDIwLjIyMmMtNC4yOTYtNC4yOTYtMTEuMjYxLTQuMjk2LTE1LjU1NiwwYy00LjI5Niw0LjI5Ni00LjI5NiwxMS4yNjEsMCwxNS41NTYgIGM0LjI5Niw0LjI5NiwxMS4yNjEsNC4yOTYsMTUuNTU2LDBDNDAuMDc0LDMxLjQ4Miw0MC4wNzQsMjQuNTE4LDM1Ljc3OCwyMC4yMjJ6IE0zMC4xMjEsMzAuMTIxYy0xLjE3MiwxLjE3Mi0zLjA3MSwxLjE3Mi00LjI0MywwICBzLTEuMTcyLTMuMDcxLDAtNC4yNDNzMy4wNzEtMS4xNzIsNC4yNDMsMFMzMS4yOTMsMjguOTUsMzAuMTIxLDMwLjEyMXoiLz4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNzM4M0JGOyIgZD0iTTM1Ljc3OCwzNS43NzhjLTAuNzYsMC43Ni0xLjYwNywxLjM3OC0yLjUwNCwxLjg3bDguMTU3LDE0LjkyYzIuMjg0LTEuMjUsNC40MzQtMi44MzUsNi4zNjgtNC43NjkgICBjMS45MzQtMS45MzQsMy41MTktNC4wODQsNC43NjktNi4zNjhsLTE0LjkyLTguMTU3QzM3LjE1NywzNC4xNzIsMzYuNTM4LDM1LjAxOCwzNS43NzgsMzUuNzc4eiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzczODNCRjsiIGQ9Ik0yMC4yMjIsMjAuMjIyYzAuNzYtMC43NiwxLjYwNy0xLjM3OCwyLjUwNC0xLjg3bC04LjE1Ny0xNC45MmMtMi4yODQsMS4yNS00LjQzNCwyLjgzNS02LjM2OCw0Ljc2OSAgIHMtMy41MTksNC4wODQtNC43NjksNi4zNjhsMTQuOTIsOC4xNTdDMTguODQzLDIxLjgyOCwxOS40NjIsMjAuOTgyLDIwLjIyMiwyMC4yMjJ6Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==" />
                                                                            </div>
                                                                            <div className="content_right">
                                                                                <span>{item.title}</span>
                                                                                <audio className="music_item" controls onPlay={(e) => this.handleResetMusic(e)} controlsList={(item.allowDownload) ? "" : "nodownload"}>
                                                                                    <source src={"https://docs.google.com/uc?export=open&id=" + item.id} type="audio/mp3"></source>
                                                                                </audio>
                                                                            </div>
                                                                        </div>
                                                                    ) : ""
                                                                }

                                                            </div>
                                                        </div>
                                                }
                                            </div> : <div id="loading"></div>
                                        }
                                    </div>
                                </div>
                        }
                    </div> :
                        <div className="login_form_a">
                            <div className="form_detail">
                                <div className="header">
                                    <span>Đăng nhập</span>
                                </div>
                                <div className="contain">
                                    <input type="text" className="user_name" value={userName} onChange={(e) => this.setState({ userName: e.target.value })} placeholder="Tên đăng nhập" />
                                    <input type="password" className="password" value={password} onChange={(e) => this.setState({ password: e.target.value })} placeholder="Mật khẩu" />
                                    <button className="bt_log_in" id="bt_log_in" onClick={(e) => {
                                        this.login(() => {
                                            this.setState({
                                                acctive_tab: 1
                                            })
                                        })
                                        this.setState({
                                            processing: true
                                        })
                                    }
                                    }>{(!this.state.processing) ? "Đăng nhập" : "Vui lòng chờ!"}</button>
                                    <span className="login_notify"></span>

                                </div>
                                <div className="hint">
                                    <p>Tài khoản mặc định:</p>
                                    <span>Quản trị viên: admin | admin</span>
                                    <span> Người dùng: vd_khoa | 123456</span>
                                </div>
                            </div>
                        </div>
                }
                {
                    (showPopup) ? <div id="insert_box">
                        <div>
                            <div className="header">
                                <span>Tải nhạc lên</span>
                                <i className="fa fa-times" onClick={() => this.setState({ showPopup: false })}></i>
                            </div>
                            <div className="detail">
                                <input type="file" name="pic" accept="audio/wav" onChange={(e) => {
                                    if (e.target.files.length > 0)
                                        this.setState({ file: e.target.files[0] })
                                }} />
                            </div>
                            <div className="submit">
                                <span onClick={() => this.handleUpload()}>{(isUploading) ? "Đang tải file lên drive..." : "Lưu file"}</span>
                            </div>
                        </div>
                    </div> : ""
                }
                {
                    (showPopupDelete) ? <div id="insert_box">
                        <div>
                            <div className="header">
                                <span>Xoá file nhạc</span>
                                <i className="fa fa-times" onClick={() => this.setState({ showPopupDelete: false, isDeleting: false, deleteSuccess: false })}></i>
                            </div>
                            <div className="detail" style={{ minHeight: "0px" }}>
                                <div className="left">
                                    {
                                        (deleteSuccess) ? <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAyODYuMDU0IDI4Ni4wNTQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI4Ni4wNTQgMjg2LjA1NDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6IzNEQjM5RTsiIGQ9Ik0xNDMuMDMxLDBDNjQuMDI3LDAsMC4wMDQsNjQuMDQsMC4wMDQsMTQzLjAyN2MwLDc4Ljk5Niw2NC4wMzEsMTQzLjAyNywxNDMuMDI3LDE0My4wMjcgICBjNzguOTg3LDAsMTQzLjAxOC02NC4wMzEsMTQzLjAxOC0xNDMuMDI3QzI4Ni4wNDksNjQuMDQ5LDIyMi4wMTgsMCwxNDMuMDMxLDB6IE0xNDMuMDMxLDI1OS4yMzYgICBjLTY0LjE4MywwLTExNi4yMDktNTIuMDI2LTExNi4yMDktMTE2LjIwOVM3OC44NTcsMjYuODE4LDE0My4wMzEsMjYuODE4czExNi4yLDUyLjAyNiwxMTYuMiwxMTYuMjA5ICAgUzIwNy4yMDYsMjU5LjIzNiwxNDMuMDMxLDI1OS4yMzZ6IE0xOTkuMjQxLDgyLjE4N2MtNi4wNzktMy42MjktMTMuODQ3LTEuNDc1LTE3LjM0Miw0LjgyN2wtNDcuOTU5LDg2LjE0N2wtMjYuNzEtMzIuNTEyICAgYy00LjgzNi01LjU2OS0xMS4yNjMtOC40NTYtMTcuMzMzLTQuODI3Yy02LjA3OSwzLjYzOC04LjU5MSwxMi4zOS00LjY1NywxOC4wMDRsMzcuMTY5LDQ1LjI0MWMyLjc4LDMuNjExLDUuOTUzLDUuNzc1LDkuMjcsNi4zOTIgICBsMC4wMjcsMC4wNTRsMC4zNCwwLjAxOGMwLjc1MSwwLjExNiwxMS45NzksMi4xOSwxNi44MTUtNi40NjNsNTUuMDQ4LTk4Ljg3NkMyMDcuNDAyLDkzLjg3OSwyMDUuMzIsODUuODI1LDE5OS4yNDEsODIuMTg3eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" /> :
                                            <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU4IDU4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1OCA1ODsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIxMjhweCIgaGVpZ2h0PSIxMjhweCI+CjxnPgoJPGc+CgkJPHBvbHlnb24gc3R5bGU9ImZpbGw6I0VGRUJERTsiIHBvaW50cz0iNDYuNSwxNCAzMi41LDAgMS41LDAgMS41LDU4IDQ2LjUsNTggICAiLz4KCQk8Zz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6I0Q1RDBCQjsiIGQ9Ik0xMS41LDIzaDI1YzAuNTUyLDAsMS0wLjQ0NywxLTFzLTAuNDQ4LTEtMS0xaC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMVMxMC45NDgsMjMsMTEuNSwyM3oiLz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6I0Q1RDBCQjsiIGQ9Ik0xMS41LDE1aDEwYzAuNTUyLDAsMS0wLjQ0NywxLTFzLTAuNDQ4LTEtMS0xaC0xMGMtMC41NTIsMC0xLDAuNDQ3LTEsMVMxMC45NDgsMTUsMTEuNSwxNXoiLz4KCQkJPHBhdGggc3R5bGU9ImZpbGw6I0Q1RDBCQjsiIGQ9Ik0zNi41LDI5aC0yNWMtMC41NTIsMC0xLDAuNDQ3LTEsMXMwLjQ0OCwxLDEsMWgyNWMwLjU1MiwwLDEtMC40NDcsMS0xUzM3LjA1MiwyOSwzNi41LDI5eiIvPgoJCQk8cGF0aCBzdHlsZT0iZmlsbDojRDVEMEJCOyIgZD0iTTM2LjUsMzdoLTI1Yy0wLjU1MiwwLTEsMC40NDctMSwxczAuNDQ4LDEsMSwxaDI1YzAuNTUyLDAsMS0wLjQ0NywxLTFTMzcuMDUyLDM3LDM2LjUsMzd6Ii8+CgkJCTxwYXRoIHN0eWxlPSJmaWxsOiNENUQwQkI7IiBkPSJNMzYuNSw0NWgtMjVjLTAuNTUyLDAtMSwwLjQ0Ny0xLDFzMC40NDgsMSwxLDFoMjVjMC41NTIsMCwxLTAuNDQ3LDEtMVMzNy4wNTIsNDUsMzYuNSw0NXoiLz4KCQk8L2c+CgkJPHBvbHlnb24gc3R5bGU9ImZpbGw6I0Q1RDBCQjsiIHBvaW50cz0iMzIuNSwwIDMyLjUsMTQgNDYuNSwxNCAgICIvPgoJPC9nPgoJPGc+CgkJPGNpcmNsZSBzdHlsZT0iZmlsbDojRUQ3MTYxOyIgY3g9IjQ0LjUiIGN5PSI0NiIgcj0iMTIiLz4KCQk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTQ1LjkxNCw0NmwzLjUzNi0zLjUzNmMwLjM5MS0wLjM5MSwwLjM5MS0xLjAyMywwLTEuNDE0cy0xLjAyMy0wLjM5MS0xLjQxNCwwTDQ0LjUsNDQuNTg2ICAgIGwtMy41MzYtMy41MzZjLTAuMzkxLTAuMzkxLTEuMDIzLTAuMzkxLTEuNDE0LDBzLTAuMzkxLDEuMDIzLDAsMS40MTRMNDMuMDg2LDQ2bC0zLjUzNiwzLjUzNmMtMC4zOTEsMC4zOTEtMC4zOTEsMS4wMjMsMCwxLjQxNCAgICBjMC4xOTUsMC4xOTUsMC40NTEsMC4yOTMsMC43MDcsMC4yOTNzMC41MTItMC4wOTgsMC43MDctMC4yOTNsMy41MzYtMy41MzZsMy41MzYsMy41MzZjMC4xOTUsMC4xOTUsMC40NTEsMC4yOTMsMC43MDcsMC4yOTMgICAgczAuNTEyLTAuMDk4LDAuNzA3LTAuMjkzYzAuMzkxLTAuMzkxLDAuMzkxLTEuMDIzLDAtMS40MTRMNDUuOTE0LDQ2eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />
                                    }

                                </div>
                                <div className="right">
                                    {
                                        (!deleteSuccess) ? <span style={{ display: "inline-block", width: "100%", verticalAlign: "top" }}> {currentFile.title}</span> : <span style={{ color: "#5FB09E", fontSize: "30px", paddingTop: "20px" }}>Xoá file thành công!</span>
                                    }
                                </div>
                                {
                                    (!deleteSuccess) ? <span>Bạn có thực sự muốn xoá?</span> : ""
                                }
                            </div>
                            {
                                (!deleteSuccess) ? <div className="submit">
                                    {
                                        (!isDeleting) ? <span style={{ color: "#333", background: "#eee" }} onClick={() => this.setState({ showPopupDelete: false, isDeleting: false, deleteSuccess: false })}>Huỷ</span> : ""
                                    }
                                    <span onClick={() => this.handleDelete()}>{(isDeleting) ? "Đang xoá file" : "Xoá"}</span>
                                </div> : ""
                            }
                        </div>
                    </div> : ""
                }
                {
                    (showPopupBuy) ? <div id="insert_box">
                        <div>
                            <div className="header">
                                <span>Mua nhạc</span>
                                <i className="fa fa-times" onClick={() => this.setState({ showPopupBuy: false, isBuying: false, buySuccess: false })}></i>
                            </div>
                            <div className="detail">
                                <div className="left">
                                    {
                                        (buySuccess) ? <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAyODYuMDU0IDI4Ni4wNTQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI4Ni4wNTQgMjg2LjA1NDsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6IzNEQjM5RTsiIGQ9Ik0xNDMuMDMxLDBDNjQuMDI3LDAsMC4wMDQsNjQuMDQsMC4wMDQsMTQzLjAyN2MwLDc4Ljk5Niw2NC4wMzEsMTQzLjAyNywxNDMuMDI3LDE0My4wMjcgICBjNzguOTg3LDAsMTQzLjAxOC02NC4wMzEsMTQzLjAxOC0xNDMuMDI3QzI4Ni4wNDksNjQuMDQ5LDIyMi4wMTgsMCwxNDMuMDMxLDB6IE0xNDMuMDMxLDI1OS4yMzYgICBjLTY0LjE4MywwLTExNi4yMDktNTIuMDI2LTExNi4yMDktMTE2LjIwOVM3OC44NTcsMjYuODE4LDE0My4wMzEsMjYuODE4czExNi4yLDUyLjAyNiwxMTYuMiwxMTYuMjA5ICAgUzIwNy4yMDYsMjU5LjIzNiwxNDMuMDMxLDI1OS4yMzZ6IE0xOTkuMjQxLDgyLjE4N2MtNi4wNzktMy42MjktMTMuODQ3LTEuNDc1LTE3LjM0Miw0LjgyN2wtNDcuOTU5LDg2LjE0N2wtMjYuNzEtMzIuNTEyICAgYy00LjgzNi01LjU2OS0xMS4yNjMtOC40NTYtMTcuMzMzLTQuODI3Yy02LjA3OSwzLjYzOC04LjU5MSwxMi4zOS00LjY1NywxOC4wMDRsMzcuMTY5LDQ1LjI0MWMyLjc4LDMuNjExLDUuOTUzLDUuNzc1LDkuMjcsNi4zOTIgICBsMC4wMjcsMC4wNTRsMC4zNCwwLjAxOGMwLjc1MSwwLjExNiwxMS45NzksMi4xOSwxNi44MTUtNi40NjNsNTUuMDQ4LTk4Ljg3NkMyMDcuNDAyLDkzLjg3OSwyMDUuMzIsODUuODI1LDE5OS4yNDEsODIuMTg3eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" /> :
                                            <img src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUwOS4yODcgNTA5LjI4NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTA5LjI4NyA1MDkuMjg3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGNpcmNsZSBzdHlsZT0iZmlsbDojNEY1NTY1OyIgY3g9IjI1NC42NDQiIGN5PSIyNTQuNjQ0IiByPSIyNTQuNjQ0Ii8+CjxwYXRoIHN0eWxlPSJmaWxsOiM3MUQ0NTY7IiBkPSJNMjUzLjI4NywzNDYuODcyYzAtOTYuOTc1LTI5LjgzOC0xODkuODgxLTQ0LjQxOS0yODQuODIxYzY2LjQ1OC0xOC4zMSwxMzUuMjktMTguMzEsMjAxLjc0OCwwICBjLTE0LjkxOSw5NC45NC00NC40MTksMTg3Ljg0Ni00NC40MTksMjg0LjgyMUMzMjguNTYyLDM0Ni44NzIsMjkwLjkyNCwzNDYuODcyLDI1My4yODcsMzQ2Ljg3MnoiLz4KPHBhdGggc3R5bGU9ImZpbGw6I0ZDRkNGRDsiIGQ9Ik0yNjIuNDQyLDMwNS44NDRjLTQuMDY5LTY5LjE3MS0xNy4yOTMtMTM3LjMyNC0yOC44MjEtMjA3LjE3MyAgYzE3LjI5My0yLjcxMywzMC4xNzctMTUuNTk3LDI4LjgyMS0zMC4xNzdjMzEuODczLTMuNzMsNjMuMDY4LTMuNzMsOTQuOTQsMGMtMS4zNTYsMTQuNTgsMTEuMTg5LDI3LjQ2NSwyOC44MjEsMzAuMTc3ICBjLTExLjUyOCw2OS44NDktMjQuNzUyLDEzOC4wMDMtMjguODIxLDIwNy4xNzNjLTEwLjg1LDAtMTkuNjY2LDEwLjg1LTIwLjAwNSwyNC43NTJjLTE4LjMxLDAtMzYuNjIsMC01NC45MywwICBDMjgyLjEwOSwzMTcuMDMzLDI3Mi45NTQsMzA1Ljg0NCwyNjIuNDQyLDMwNS44NDR6Ii8+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6IzcxRDQ1NjsiIGQ9Ik0zMDkuNTczLDI1MS41OTJjLTIyLjcxOCwwLTQ0LjA3OS0yMi4wNC00OC4xNDgtNDkuNTA1Yy00LjA2OS0yNy40NjUsMTcuOTcxLTUyLjU1Niw0OC4xNDgtNTIuODk1ICAgYzMwLjE3NywwLDUyLjIxNywyNS40Myw0OC4xNDgsNTIuODk1UzMzMi4yOTEsMjUxLjU5MiwzMDkuNTczLDI1MS41OTJ6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNzFENDU2OyIgZD0iTTMwOS41NzMsMTE2LjY0MWMtNy40NiwwLTEzLjkwMi01LjQyNS0xMy45MDItMTIuMjA3Yy0wLjMzOS02Ljc4MSw2LjEwMy0xMi41NDYsMTMuOTAyLTEyLjU0NiAgIGM4LjEzOCwwLDE0LjI0MSw1Ljc2NCwxMy45MDIsMTIuNTQ2QzMyMy40NzUsMTExLjIxNiwzMTcuMDMzLDExNi42NDEsMzA5LjU3MywxMTYuNjQxeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6IzcxRDQ1NjsiIGQ9Ik0zMDkuNTczLDMwNi41MjJjLTUuMDg2LDAtOS4xNTUtNS4wODYtOS4xNTUtMTEuODY4YzAtNi40NDIsNC4wNjktMTEuODY4LDkuMTU1LTExLjg2OCAgIHM5LjE1NSw1LjQyNSw5LjE1NSwxMS44NjhDMzE4LjcyOCwzMDEuMDk3LDMxNC42NiwzMDYuNTIyLDMwOS41NzMsMzA2LjUyMnoiLz4KPC9nPgo8cGF0aCBzdHlsZT0iZmlsbDojRkNGQ0ZEOyIgZD0iTTI5Ni4zNSwyMjEuNzU0YzEwLjE3MiwwLDE4LjMxLTkuNDk0LDE4LjY0OS0yMS4wMjNjMC01LjA4Niw0LjA2OS04LjgxNiw4LjQ3Ny04LjgxNiAgYzQuNzQ3LDAsOC40NzcsNC4wNjksOC4xMzgsOS4xNTVjMCwyLjM3NC0xLjM1Niw0Ljc0Ny0zLjA1Miw2LjQ0MmMtMi4zNzQsMi4zNzQtMi43MTMsNi4xMDMtMC42NzgsOC40NzcgIGMyLjAzNCwyLjM3Myw1LjQyNSwyLjcxMyw3LjQ2LDAuMzM5YzIuNzEzLTIuMzc0LDQuNzQ3LTUuNDI1LDUuNzY0LTkuMTU1YzEuMzU2LDAsMi43MTMsMCw0LjA2OSwwYzMuMDUyLDAsNS43NjQtMi4zNzQsNi4xMDMtNS43NjQgIGMwLjMzOS0zLjM5MS0yLjAzNC02LjEwMy01LjA4Ni02LjEwM2MtMS4zNTYsMC0yLjcxMywwLTQuMDY5LDBjLTEuNjk1LTguNDc3LTkuMTU1LTE1LjI1OC0xOC42NDktMTUuNTk3ICBjLTExLjUyOC0wLjMzOS0yMC4zNDQsOS40OTQtMjAuMDA1LDIxLjAyM2MwLDUuMDg2LTMuMzkxLDguODE2LTguMTM4LDkuMTU1Yy00LjQwOCwwLTguNDc3LTMuNzMtOC44MTYtOC44MTYgIGMwLTIuMzc0LDAuNjc4LTQuNzQ3LDIuMzczLTYuNDQyYzIuMDM0LTIuMzc0LDIuMDM0LTYuMTAzLTAuMzM5LTguNDc3Yy0yLjM3NC0yLjM3NC02LjEwMy0yLjM3NC04LjEzOCwwICBjLTEuNjk1LDIuMzczLTMuMDUyLDUuNzY0LTQuMDY5LDkuMTU1Yy0xLjM1NiwwLTIuNzEzLDAtNC4wNjksMGMtMy4wNTIsMC01LjQyNSwzLjA1Mi01LjA4Niw2LjEwMyAgYzAuMzM5LDMuMzkxLDMuMDUyLDUuNzY0LDYuMTAzLDUuNzY0YzEuMzU2LDAsMi43MTMsMCwzLjczLDBDMjgwLjc1MiwyMTUuNjUsMjg4LjIxMiwyMjEuNzU0LDI5Ni4zNSwyMjEuNzU0eiIvPgo8cGF0aCBzdHlsZT0iZmlsbDojRjdDRkEyOyIgZD0iTTQxMi4zMTMsMzMyLjI5MUw0MTIuMzEzLDMzMi4yOTFjMC0xNC4yNDEtMTEuNTI5LTI1Ljc3LTI1Ljc3LTI1Ljc3aC00LjA2OSAgYzE0LjU4LDAsMjYuMTA5LTExLjg2OCwyNS43Ny0yNi40NDhjLTAuMzM5LTEzLjkwMi0xMi41NDYtMjQuNzUyLTI2Ljc4Ny0yNC43NTJIMjQ1LjQ4OWwtNC43NDctMjkuMTZsLTY4LjE1NCw3Mi45MDFoLTQ3LjgwOSAgVjQzNS4wM2gxNy45NzFjMTEuMTg5LDAsMjIuMzc5LDMuNzMsMzEuNTM0LDEwLjE3MmwwLDBjMTMuOTAyLDEwLjE3MiwzMC41MTcsMTUuNTk3LDQ3LjQ3LDE1LjU5N2gxNTUuNjM0ICBjMTQuMjQxLDAsMjYuNDQ4LTEwLjg1LDI2Ljc4Ny0yNC43NTJjMC4zMzktMTQuNTgtMTEuMTg5LTI2LjQ0OC0yNS43Ny0yNi40NDhoMy4wNTJjMTQuMjQxLDAsMjYuNDQ4LTEwLjg1LDI2Ljc4Ny0yNC43NTIgIGMwLjMzOS0xNC41OC0xMS4xODktMjYuNDQ4LTI1Ljc3LTI2LjQ0OGg0LjA2OUM0MDAuNzg0LDM1Ny43MjIsNDEyLjMxMywzNDYuMTkzLDQxMi4zMTMsMzMyLjI5MXoiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzZFQjFFMTsiIGQ9Ik0xMDUuMTEzLDQ2MC44aDI2LjQ0OFYyOTQuNjU0SDMuMDUyQzEzLjkwMiwzNjIuODA4LDUxLjg3OCw0MjEuODA3LDEwNS4xMTMsNDYwLjh6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />
                                    }

                                </div>
                                <div className="right">
                                    {
                                        (!buySuccess) ? <span style={{ display: "inline-block", width: "100%", verticalAlign: "top" }}> {currentFile.title}</span> : <span style={{ color: "#5FB09E", fontSize: "30px", paddingTop: "20px" }}>Mua bài hát thành công!</span>
                                    }
                                </div>
                                {
                                    (!buySuccess) ? <span>Bạn có thực sự muốn mua bài hát này?</span> : ""
                                }
                            </div>
                            {
                                (!buySuccess) ? <div className="submit">
                                    {
                                        (!isBuying) ? <span style={{ color: "#333", background: "#eee" }} onClick={() => this.setState({ showPopupBuy: false, isBuying: false, buySuccess: false })}>Huỷ</span> : ""
                                    }
                                    <span onClick={() => this.handlBuy()}>{(isBuying) ? "Đang mua file" : "Mua"}</span>
                                </div> : ""
                            }
                        </div>
                    </div> : ""
                }
            </div>
        )
    }
}
export default Home