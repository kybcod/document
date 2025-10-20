
$(document).ready(function () {
	$('.login_input').on("keydown", function (event) {
		if (event.keyCode === 13) {
			loginCheck();
		}
	});
});


const loginCheck = () => {
	let $id = $('#id');
	let $pw = $('#pw');

	if (!$id.val()) {
		basicAlert({ icon: 'error', text: '아이디를 입력하세요.' });
		$id.focus();
		return;
	}

	let param = {
		userId: $id.val(),
		userPass: $pw.val(),
	}

	$.ajax({
		url: 'user/loginck',
		type: 'POST',
		data: JSON.stringify(param),
		contentType: 'application/json',
		success: function() {
			location.href = contextPath;
		},
		error: function(xhr) {
			let res = xhr.responseJSON;
			if (xhr.status === 400 && res.data) {
				openPwChangeModal(res.data);
			} else {
				basicAlert({ icon: 'error', text: res.msg });
			}
		}
	});
}


