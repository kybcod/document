/**
 * sweet_alert custom
 */

/**
 * icon : success, error, warning, info, question
 */
let basicAlert = null;
let confirmAlert = null;
let inputAlert = null;

let researchFlag = false;

// TODO blur 시 콜백 함수를 사용하기위해 위처럼 처리했었음. => 추후 깜빡임 처리 예정.
$(function() {

	basicAlert = (data) => {
		// alert 호출 후 focus가 된 element가 담길 변수.
		let focusedElement = null;
		// 모든 focus event 삭제
		$(':focus').blur();

		Swal.fire({
			icon: data.icon,
			title: data.text ? data.title : '',
			html: data.text || data.title,
			confirmButtonText: '확인',
			confirmButtonColor: '#5C8DE3',
			focusConfirm: false,
			didOpen: () => {
				// 해당 sweetAlert가 팝업될 때, 우측 빈공간을 제어 하기 위함.
				this.body.style = 'padding-right : 0px';
				// 해당 focus가 된 element 저장
				focusedElement = document.querySelector(":focus");

				// enter 키 이벤트 감지
				document.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						Swal.clickConfirm(); // 확인 버튼 클릭
					}
				});
			},
			willClose: () => {
				// enter 키 이벤트 리스너 제거
				document.removeEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						Swal.clickConfirm(); // 확인 버튼 클릭
					}
				});

			}
		}).then(() => {

			if(data.callback){
				if(data.callback.length > 1){
					for (const func of data.callback){
						func();
					}
				}else{
					data.callback();
				}
			}
			
			if (focusedElement) {
				focusedElement.focus();
			}
		});
	}

	confirmAlert = (data) => {
		return new Promise((resolve, reject) => {
			$(':focus').blur();
			Swal.fire({
				title: data.text ? data.title : '',
				html: data.text || data.title,
				icon: data.icon,
				showCancelButton: true,
				confirmButtonColor: '#5C8DE3',
				cancelButtonColor: '#343a40',
				confirmButtonText: '확인',
				cancelButtonText: '취소',
				didOpen: () => {
					// 해당 sweetAlert가 팝업될 때, 우측 빈공간을 제어 하기 위함.
				},
			}).then((result) => {
				resolve(result);
				researchFlag = true;
				// 구분 값 추가
			}).catch(error => {
				reject(error);
			});
		});
	}

	inputAlert = (data) => {
		return new Promise((resolve, reject) => {
			Swal.fire({
				title: data.text ? data.title : '',
				html: data.text || data.title,
				icon: data.icon,
				showCancelButton: true,
				confirmButtonColor: '#5C8DE3',
				cancelButtonColor: '#343a40',
				confirmButtonText: '확인',
				cancelButtonText: '취소',
				input: data.input,
				inputPlaceholder: data.placeholder,
			}).then((result) => {
				resolve(result);
				// fire,then에 대한 오류를 반환.
			}).catch(error => {
				reject(error);
			});
		});
	}

});
