let contextPath = window.location.pathname.substring(0, window.location.pathname.indexOf("/", 1));
var dbmsLookupData = [];

/*
 * 서버에서 메뉴 데이터를 가져와 사이드바 메뉴를 동적으로 생성하는 함수
 */
function createDynamicSidebarMenu() {
    $.ajax({
        url: contextPath + '/menu/activeList',
        type: 'POST',
        dataType: 'json',
        success: function(menuData) {
            // 트리 구조로 변환
            const menuTree = buildMenuTree(menuData, '0000'); // 최상위 메뉴는 '0000'
            const sidebarMenu = $('.sidebar-menu');
            sidebarMenu.empty();

            // 트리 구조 렌더링
            renderMenu(menuTree, sidebarMenu);

            // 기본 동작: 첫 번째 메뉴 열기
            // 첫 번째 메뉴 기본 동작 수정
            const firstMenu = findFirstLeaf(menuTree);
            if (firstMenu) {
                const tabId = `tab-${firstMenu.menuId}`;

                // 메뉴 클릭 실행
                menuClickFn(firstMenu.menuUrl, null, tabId, firstMenu.menuName);

                // leaf 메뉴 DOM 찾기
                const $firstMenuItem = $(`.submenu-item[onclick*="${firstMenu.menuUrl}"]`);
                openParentMenus($firstMenuItem); // 상위 메뉴들 열기
            }
        },
        error: function(err) {
            console.error("메뉴 데이터를 가져오는 데 실패했습니다.", err);
            // 에러 메시지 표시
            $('.sidebar-menu').html('<div class="p-4 text-red-500">메뉴를 불러올 수 없습니다.</div>');
        }
    });
}

// === 메뉴 트리 빌드 ===
function buildMenuTree(menuData, parentId) {
    return menuData
        .filter(m => m.menuGroup === parentId)
        .sort((a, b) => a.menuOrder - b.menuOrder)
        .map(menu => {
            const children = buildMenuTree(menuData, menu.menuId); // 재귀
            return { ...menu, children };
        });
}

// === 메뉴 렌더링 ===
function renderMenu(menus, container, depth = 0) {
    menus.forEach(menu => {
        if (menu.children.length > 0) {
            const menuGroup = $('<div class="menu-group"></div>');
            const menuTitle = $(`<div class="menu-title depth-${depth}" onclick="toggleSubmenu(this)">
                                  ${menu.menuName}<span class="arrow">▼</span>
                               </div>`);
            const submenuContainer = $('<div class="submenu"></div>');

            renderMenu(menu.children, submenuContainer, depth + 1);

            menuGroup.append(menuTitle, submenuContainer);
            container.append(menuGroup);
        } else {
            const fragment = menu.menuUrl;
            const tabId = `tab-${menu.menuId}`;
            const subMenuItem = $(`<div class="submenu-item depth-${depth}"
                                    onclick="menuClickFn('${fragment}', this, '${tabId}', '${menu.menuName}')">
                                    ${menu.menuName}
                                 </div>`);
            container.append(subMenuItem);
        }
    });
}

// 첫 번째 leaf node(실제 컨텐츠 메뉴) 찾기
function findFirstLeaf(menuTree) {
    for (let menu of menuTree) {
        if (menu.children.length === 0) {
            return menu; // 자식이 없으면 이게 첫 번째 실제 메뉴
        } else {
            const found = findFirstLeaf(menu.children);
            if (found) return found;
        }
    }
    return null;
}

// leaf 메뉴 클릭 시 상위 메뉴도 열기
function openParentMenus(menuElement) {
    const $submenu = $(menuElement).closest('.submenu');

    if ($submenu.length > 0) {
        const $parentTitle = $submenu.prev('.menu-title');

        // 현재 submenu 및 title 열기
        $submenu.addClass('open');
        $parentTitle.addClass('expanded');

        // 형제 메뉴 닫기 (중복 확장 방지)
        const $siblingGroups = $parentTitle.closest('.menu-group').siblings('.menu-group');
        $siblingGroups.find('.submenu').removeClass('open');
        $siblingGroups.find('.menu-title').removeClass('expanded');

        // 상위로 재귀
        openParentMenus($parentTitle);
    }
}



// 서브메뉴 토글 함수
function toggleSubmenu(element) {
    const $element = $(element);
    const submenu = $element.next('.submenu');

    // 현재 메뉴가 몇 번째 depth인지 파악
    const isTopLevel = $element.closest('.sidebar-menu').children('.menu-group').children('.menu-title').is($element);

    if (isTopLevel) {
        // 대메뉴 클릭인 경우: 다른 대메뉴들 닫기
        $('.sidebar-menu > .menu-group > .menu-title').not($element).removeClass('expanded');
        $('.sidebar-menu > .menu-group > .submenu').not(submenu).removeClass('open');
    } else {
        // 중메뉴 이하 클릭인 경우: 같은 부모 아래만 처리
        $element.parent().children('.submenu').not(submenu).removeClass('open');
        $element.parent().children('.menu-title').not($element).removeClass('expanded');
    }

    // 현재 메뉴 토글 (공통 처리)
    submenu.toggleClass('open');
    $element.toggleClass('expanded');
}






// 메뉴 클릭 시 실행되는 함수
function menuClickFn(fragment, element, tabId, title){
    loadContent(fragment, element, tabId, title);
    closeSidebar();
}

// 사이드바 닫기 함수
function closeSidebar() {
    $('#main-sidebar').removeClass('open');
    $('.siteMapBtn').removeClass('open');
    $('.siteMapBtn .close').hide();
    $('.siteMapBtn .open').show();
}


// === 콘텐츠 로드 ===
function loadContent(fragment, btn, tabId, tabName) {
    // 이미 탭이 열려 있으면 → 전환만
    if ($("#" + tabId).length) {
        openTab(tabId);
        return;
    }

    // 탭 버튼 추가
    $("#tab-buttons").append(
        `<button class="tab-button" data-tab="${tabId}" onclick="openTab('${tabId}')">${tabName}
            <span onclick="closeTab('${tabId}', event)">✕</span>
         </button>`
    );

    // 탭 콘텐츠 Ajax 로드
    $.ajax({
        url: contextPath + '/' + fragment,
        type: 'GET',
        success: function(data) {
            $("#tab-content").append(
                `<div class="tab-pane" id="${tabId}">${data}</div>`
            );
            openTab(tabId);

            $(document).trigger("tabLoaded", [tabId]);
        },
        error: function(xhr) {
            if (xhr.status === 401 && xhr.responseJSON && xhr.responseJSON.sessionExpired) {
                basicAlert({
                    icon: 'warning',
                    text: '세션이 만료되었습니다. 다시 로그인 해주세요.',
                    callback: () => {
                        window.location.href = contextPath + '/login';
                    }
                });

            }
        }
    });
}

function openTab(tabId) {
    $(".tab-pane").hide();
    $(".tab-button").removeClass("active");

    $("#" + tabId).show();
    $(`.tab-button[data-tab="${tabId}"]`).addClass("active");
}

function closeTab(tabId, event) {
    event.stopPropagation();
    $("#" + tabId).remove();
    $(`.tab-button[data-tab="${tabId}"]`).remove();

    // 닫은 뒤 다른 탭이 있으면 첫 번째 탭 열기
    let firstTab = $(".tab-button").first().data("tab");
    if (firstTab) openTab(firstTab);
}

















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

// 공통 그리드 추가/함수/삭제 ajax 함수
function sendDataToServer(url, type, data, deferred, gridInstance, reloadFn) {
    $.ajax({
        url: url,
        type: type,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: (res) => {
            gridInstance.option("editing.popup.visible", false);

            if (deferred) {
                deferred.resolve();
            }

            reloadFn();
        },
        error: (err) => {
            if (deferred) {
                deferred.reject();
            }

            basicAlert({ icon: 'error', text: err.responseJSON?.msg || err.responseText });
        },
        complete(){
            gridInstance.endCustomLoading();
        }
    });
}
















function openPwChangeModal(userId) {
    $("#chgUserId").val(userId);
    $("#pwChangeModal").show();
}

function closePwChangeModal() {
    $("#pwChangeModal").hide();
}

function changePassword() {
    let userId = $('#chgUserId').val();
    let userTel = $('#chgTel').val();
    let userPass = $('#chgPw').val();
    let userPassCheck = $('#chgPwConfirm').val();

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
            basicAlert({ icon: 'success', title: "", text: '비밀번호가 변경되었습니다. 다시 로그인해주세요.' });
            closePwChangeModal();
            $("#pw").val("");
        },
        error: function(xhr) {
            const msg = xhr.responseJSON?.msg || xhr.responseText || '오류가 발생했습니다. 새로고침 후 다시 시도해주세요.';
            basicAlert({ icon: 'error', title: "", text: msg });
        }
    });
}
