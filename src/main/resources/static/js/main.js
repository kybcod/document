let contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 1));


// 로그아웃
const logout = () => {
    confirmAlert({ icon: 'success', text: '로그아웃 하시겠습니까?' })
        .then(result => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'logout',
                    type: 'GET',
                    success: function(res) {
                        location.href = contextPath + '/logout';
                    },
                    error: function(xhr) {
                        basicAlert({ icon: 'error', text: '로그아웃에 실패했습니다.' });
                    }
                });
            }
        })
        .catch(error => console.error(error));
};

const userLogout = () => {
    confirmAlert({ icon: 'success', text: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' })
        .then(result => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'logout',
                    type: 'GET',
                    success: function(res) {
                        location.href = contextPath + '/logout';
                    },
                    error: function(xhr) {
                        basicAlert({ icon: 'error', text: '로그아웃에 실패했습니다.' });
                    }
                });
            }
        })
        .catch(error => console.error(error));
};

// 정보수정
function updateInfo() {
    $("#updateInfoPopup").dxPopup({
        visible: true,
        showTitle: true,
        title: "정보수정",
        width: 500,
        height: 600,
        contentTemplate: function(container) {
            container.append(`
                <div class="userInfo-content">
                    <p>
                        <label>아이디</label>
                        <input type="text" id="userId">
                    </p>
                    <p>
                        <label>이름</label>
                        <input type="text" id="userName">
                    </p>
                    <p>
                        <label>전화번호</label>
                        <input type="text" id="userTel" placeholder="등록된 전화번호 입력">
                        <small>※ 01x-xxxx-xxxx 형식으로 작성바랍니다.</small>
                    </p>
                    <p>
                        <label>이메일</label>
                        <input type="text" id="userEmail">
                    </p>
                    <p>
                        <label>암호</label>
                        <button id="resetPasswordBtn">비밀번호 초기화</button>
                    </p>
                    
                </div>
            `);

            $.ajax({
                url: "user/userId",
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data : JSON.stringify({userId : loginUser.userId}),
                success(res) {
                    $("#userId").val(res.userId);
                    $("#userName").val(res.userName);
                    $("#userTel").val(res.userTel);
                    $("#userEmail").val(res.userEmail);
                },
            });

            $("#resetPasswordBtn").on("click", function() {
                openPwChangeModal(loginUser.userId);
            });
        },
        toolbarItems: [
            {
                toolbar: "bottom",
                location: "after",
                widget: "dxButton",
                options: {
                    text: "Save",
                    type: "success",
                    width: 120,
                    height: 40,
                    stylingMode: "contained",
                    elementAttr: {
                        style: "font-size: 15px;"
                    },
                    onClick: function() {
                        const emailPattern = /^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

                        if (!emailPattern.test($("#userEmail").val())) {
                            basicAlert({ icon: 'error', text: '이메일 형식이 올바르지 않습니다. 예: user@example.com' });
                            return;
                        }

                        const data = {
                            userId: $("#userId").val(),
                            userName: $("#userName").val(),
                            userTel: $("#userTel").val(),
                            userEmail: $("#userEmail").val()
                        };
                        sendDataToServer("user", "PUT", data);
                        $("#updateInfoPopup").dxPopup("hide");
                    }
                }
            },
            {
                toolbar: "bottom",
                location: "after",
                widget: "dxButton",
                options: {
                    text: "Cancel",
                    width: 120,
                    height: 40,
                    stylingMode: "contained",
                    elementAttr: {
                        style: "font-size: 15px;"
                    },
                    onClick: function() {
                        $("#updateInfoPopup").dxPopup("hide");
                    }
                }
            }
        ],
    });
}


// 공통 그리드 추가/함수/삭제 ajax 함수
function sendDataToServer(url, type, data, deferred, gridInstance, reloadFn) {
    $.ajax({
        url: url,
        type: type,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (res) => {

            if(gridInstance){
                gridInstance.option("editing.popup.visible", false);
            }

            if (deferred) {
                deferred.resolve();
            }

            if(reloadFn){
                reloadFn();
            }

        },
        error: (err) => {
            if (deferred) {
                deferred.reject();
            }

            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            if(gridInstance){
                gridInstance.endCustomLoading();
            }
        }
    });
}
















function openPwChangeModal(userId) {
    $("#chgUserId").val(userId);
    $("#pwChangeModal").show();
}

function closePwChangeModal() {
    $("#pwChangeModal").hide();
    $('#chgUserId').val("");
    $('#chgTel').val("");
    $('#chgPw').val("");
    $('#chgPwConfirm').val("");
}

function changePassword() {
    let userId = $('#chgUserId').val();
    let userTel = $('#chgTel').val();
    let userPass = $('#chgPw').val();
    let userPassCheck = $('#chgPwConfirm').val();

    if (!userId || userId === "") {
        basicAlert({ icon: 'error', title: "", text: '아이디를 입력하세요.' });
        return;
    }

    if (!userTel || userTel === "") {
        basicAlert({ icon: 'error', title: "", text: '전화번호를 입력하세요.' });
        return;
    }

    if (!userPass || !userPassCheck) {
        basicAlert({ icon: 'error', title: "", text: '비밀번호를 입력하세요.' });
        return;
    }
    if (userPass !== userPassCheck) {
        basicAlert({ icon: 'error', title: "", text: '비밀번호가 일치하지 않습니다.' });
        return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(userPass)) {
        basicAlert({ icon: 'error', title: "", text: '비밀번호 규칙(영문+숫자+특수문자 8자리 이상)에 맞지 않습니다.' });
        return;
    }

    $.ajax({
        url: 'user/changePassword',
        type: "POST",
        data: JSON.stringify({ userId, userTel, userPass }),
        contentType: 'application/json',
        success: function(res) {
            basicAlert({ icon: 'success', title: "", text: '비밀번호가 변경되었습니다.' });
            closePwChangeModal();
            $("#pw").val("");

            if (loginUser.userId === userId) {
                userLogout();
            }
        },
        error: function(xhr) {
            const msg = xhr.responseJSON?.msg || xhr.responseText || '오류가 발생했습니다. 새로고침 후 다시 시도해주세요.';
            basicAlert({ icon: 'error', title: "", text: msg });
        }
    });
}


// 전화번호 입력 시 하이픈 자동 추가
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let result = '';
    if (value.length < 4) {
        result = value;
    } else if (value.length < 8) {
        result = value.substring(0, 3) + '-' + value.substring(3);
    } else if (value.length < 11) {
        result = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
    } else {
        result = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
    }

    input.value = result;
}



//날짜를 문자열로
function dateToString(type) {

    /* 시작기간 : 현재날짜
     * 종료기간 : 오늘날짜
     */

    let Nowdate = new Date();
    // 30일 전의 날짜 계산
    let Agodate = new Date(Nowdate.getTime() - (30 * 24 * 60 * 60 * 1000));

    //현재 달
    let NowMonth = ((Nowdate.getMonth() + 1) >= 10 ? (Nowdate.getMonth() + 1) : '0' + (Nowdate.getMonth() + 1));
    //현재 일
    let NowDay = (Nowdate.getDate() >= 10 ? Nowdate.getDate() : '0' + Nowdate.getDate());
    // 한달 전 달
    let AgoMonth = ((Agodate.getMonth() + 1) >= 10 ? (Agodate.getMonth() + 1) : '0' + (Agodate.getMonth() + 1));
    // 일주일전 일
    //	let AgoDay = (Agodate.getDate() >= 10 ? Agodate.getDate() : '0' + Agodate.getDate());

    if (type === 'start') {
        // 한달 전 날짜
        let day = Agodate.getDate();

        let formattedDay = (day < 10) ? '0' + day : day;

        Stringdate = Agodate.getFullYear() + '-' + AgoMonth + '-' + formattedDay;
    } else if (type === 'end') {
        //현재 날짜
        Stringdate = Nowdate.getFullYear() + '-' + NowMonth + '-' + NowDay;
    } else if (type = 'endMonth') {
        let d = new Date();
        let sel_month = 1; // 월을 조절하시면 됩니다. -1이면 전달을 +1이면 다음달을..
        d.setMonth(d.getMonth() + sel_month);

        let year = d.getFullYear();
        let month = ('0' + (d.getMonth() + 1)).slice(-2);
        let day = ('0' + d.getDate()).slice(-2);
        Stringdate = year + '-' + month + '-' + day;

        //		logDisplay(1,"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:"+Stringdate);

    }
    //현재 날짜 기준 다음 날짜 선택 x
    let now_utc = Date.now();
    let timeOff = new Date().getTimezoneOffset() * 60000;
    let today = new Date(now_utc - timeOff);
    let oneMonthAgo = new Date(today);

    oneMonthAgo.setMonth(today.getMonth() - 1);

    //	let oneMonthAgoISO = oneMonthAgo.toISOString().split("T")[0];
    let todayISO = today.toISOString().split("T")[0];

    // let todayCheck = document.getElementsByClassName("date_input");
    //콜백관리의 회수와 콜백이력은 최대 날짜 제한을 푼다
    let todayCheck = $(".date_input").not("#end_reservation_date, #callback_mgmt_endDate");
    if (todayCheck.length > 0) {
        for (let i = 0; i < todayCheck.length; i++) {
            todayCheck[i].setAttribute("max", todayISO);
        }
    }
    return Stringdate;
}
