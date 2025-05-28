//공통 모달 함수
function showConfirm(message, options) {
    if (!message) return;

    const settings = $.extend({
        title: '알림',
        confirmText: '확인',
        showOutline: true,
        showBtnWrap: true,
        showCancel: false,
        cancelText: '취소',
        confirmCallback: null,
        cancelCallback: null,
        closeOnClickOutside: true,
        modalId: 'krds_auto_modal',
        isHtml: false,
        onDomReadyCallback: null,
    }, options);

    const messageContent = settings.isHtml ? message : message.replace(/\n/g, '<br>');

    // 기존 모달 제거
    $('#' + settings.modalId).remove();


    const $modal = $(`
        <section id="${settings.modalId}" class="krds-modal fade in shown" role="dialog" aria-labelledby="tit_${settings.modalId}">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="tit_${settings.modalId}" class="modal-title">${settings.title}</h2>
                    </div>
                    <div class="modal-conts" ${!settings.showOutline ? `style="--krds-box-shadow-outline : none;"` : ''}>
                        <div class="conts-area">${messageContent}</div>
                    </div>
                    ${settings.showBtnWrap ? `
                    <div class="modal-btn btn-wrap">
                        ${settings.showCancel ? `<button type="button" class="krds-btn medium tertiary close-modal cancel-btn">${settings.cancelText}</button>` : ''}
                        <button type="button" class="krds-btn medium primary close-modal confirm-btn">${settings.confirmText}</button>
                    </div>
                    ` : ''}
                    <button type="button" class="krds-btn medium icon btn-close close-modal" title="닫기" tabindex="1">
                        <span class="sr-only">닫기</span>
                        <i class="svg-icon ico-popup-close"></i>
                    </button>
                </div>
            </div>
            <div class="modal-back in"></div>
        </section>
    `);

    $('body').append($modal);

    // 포커스 이동
    $modal.find('.conts-area').attr('tabindex', '-1').focus();

    // 확인 버튼 이벤트
    $modal.find('.confirm-btn').on('click', function () {
        const shouldClose = settings.confirmCallback?.();
        if (shouldClose !== false) closeModal($modal);
    });

    // 취소/닫기 버튼 이벤트
    $modal.find('.cancel-btn, .btn-close').on('click', function () {
        closeModal($modal);
        settings.cancelCallback?.();
    });

    // 바깥 클릭 시 닫기
    if (settings.closeOnClickOutside) {
        $modal.on('click', function (e) {
            if (!$(e.target).closest('.modal-dialog').length) {
                closeModal($modal);
                settings.cancelCallback?.();
            }
        });
    }

    // DOM 준비 콜백
    if (typeof settings.onDomReadyCallback === 'function') {
        settings.onDomReadyCallback();
    }
}

//스타일 모달 닫기
function closeModal($modal) {
    $modal.removeClass('in shown').fadeOut(200, function () {
        $modal.remove();
    });
}

//로딩 모달
function showLoading() {
    hideLoading();
    const $loading = $(`
        <div class="krds-modal loading-layer shown" role="alert" style="z-index:1050;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-conts">
                        <div class="conts-area" style="text-align:center; padding:40px;">
                            <div class="loading-spinner krds">
                                <span class="sr-only">로딩중입니다...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-back in"></div>
        </div>
    `);
    $('body').append($loading);
}

//로딩 모달 닫기
function hideLoading() {
    $('.krds-modal.loading-layer').fadeOut(200, function () {
        $(this).remove();
    });
}

// 쿠키 값을 가져오는 함수
function getCookie(name) {
    const cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }

    return null;
}

// maxlength를 초과하지 않도록 제한
function maxLengthCheck(object) {
    if (object.value.length > object.maxLength) {
        object.value = object.value.slice(0, object.maxLength);
    }
}

// 주소 검색 결과 콜백 처리
function jusoCallBack(roadFullAddr, roadAddrPart1, addrDetail, roadAddrPart2,
                      engAddr, jibunAddr, zipNo, admCd, rnMgtSn, bdMgtSn, detBdNmList,
                      bdNm, bdKdcd, siNm, sggNm, emdNm, liNm, rn, udrtYn,
                      buldMnnm, buldSlno, mtYn, lnbrMnnm, lnbrSlno, emdNo) {

    $('#sttAddr1').val(roadAddrPart1)
        .data('zipcode', zipNo)
        .data('jibun', jibunAddr)
        .data('siNm', siNm)
        .data('sggNm', sggNm)
        .data('emdNm', emdNm)
        .data('roadFull', roadFullAddr);

    // 상세주소 필드로 포커스 이동
    $('#sttAddr2').val(addrDetail).focus();
}

// 서버 시간 가져오는 함수
async function fetchServerTime() {
    try {
        // 서버 시간 반환 API (형식: { "year": 0000, "month": 00, "day": 00 })
        const response = await fetch('/api/server-time.do');
        if (!response.ok) throw new Error('Server time fetch failed');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching server time:', error);
        return null;
    }
}

// 달력 생성 함수
function createCalendar(year, month) {
    const $calendarWrap = $('<div>', {
        class: 'calendar-wrap bottom',
        'aria-label': '달력',
        tabindex: 0,
        'data-calendar-id': 'main'
    });

    const $calendarHead = $(`<div class="calendar-head">
        <button type="button" class="btn-cal-move prev"><span class="sr-only">이전 달</span></button>
        <div class="calendar-switch-wrap">
            <div class="calendar-drop-down">
                <button type="button" class="btn-cal-switch year" aria-label="연도 선택" role="combobox" aria-haspopup="listbox" aria-expanded="false">${year}년</button>
            </div>
            <div class="calendar-drop-down">
                <button type="button" class="btn-cal-switch month" aria-label="월 선택" role="combobox" aria-haspopup="listbox" aria-expanded="false" >${String(month).padStart(2, '0')}월</button>
            </div>
        </div>
        <button type="button" class="btn-cal-move next"><span class="sr-only">다음 달</span></button>
    </div>`);

    const $calendarBody = $('<div class="calendar-body">');
    const $tableWrap = $('<div class="calendar-table-wrap">');
    const $table = $(`
        <table class="calendar-tbl">
            <caption>${year}년 ${month}월</caption>
            <thead>
                <tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr>
            </thead>
            <tbody></tbody>
        </table>
    `);

    const $tbody = $table.find('tbody');
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let $tr = $('<tr>');
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i;
        const prevDateStr = `${year}.${String(month - 1).padStart(2, '0')}.${String(date).padStart(2, '0')}`;
        const $td = $(`<td class="old" data-date="${prevDateStr}">
        <button type="button" class="btn-set-date" disabled><span>${date}</span></button>
    </td>`);
        $tr.append($td);
    }


    for (let date = 1; date <= lastDay.getDate(); date++) {
        if ($tr.children().length === 7) {
            $tbody.append($tr);
            $tr = $('<tr>');
        }
        const dateStr = `${year}.${String(month).padStart(2, '0')}.${String(date).padStart(2, '0')}`;
		const formattedStr = dateStr.replace(/\./g, '-');
		const dayOf = new Date(formattedStr);
		
		// 영어 요일 약어 배열
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		
		const dayOfWeek = days[dayOf.getDay()];
        
        if(dayOfWeek == "Sun"){
	        const $td = $(`<td class="day-off" data-date="${dateStr}">
	            <button type="button" class="btn-set-date"><span>${date}</span></button>
	        </td>`);
	        $tr.append($td);
		}else{
	        const $td = $(`<td data-date="${dateStr}">
	            <button type="button" class="btn-set-date"><span>${date}</span></button>
	        </td>`);
	        $tr.append($td);
		}
    }
    if ($tr.children().length) $tbody.append($tr);

    $tableWrap.append($table);
    $calendarBody.append($tableWrap);

    const $calendarFooter = $(`<div class="calendar-footer">
        <div class="calendar-btn-wrap">
            <button type="button" class="krds-btn small text get-today">오늘</button>
            <button type="button" class="krds-btn small tertiary cancel-calendar">취소</button>
            <button type="button" class="krds-btn small primary confirm-calendar">확인</button>
        </div>
    </div>`);

    $calendarWrap.append($calendarHead, $calendarBody, $calendarFooter);
    return $calendarWrap;
}

// 달력 선택값
let selectStartDateStr, selectEndDateStr;
let currentYear,currentMonth;
// 달력 UI 세팅 함수
async function initCalendarUI($calendarWrap, savedStartDate = null, savedEndDate = null, mode = 'range') {
    const serverTime = await fetchServerTime();
    if (!serverTime) return;

    const $tblCells = $calendarWrap.find('.calendar-tbl td');
    const $tblCellBtns = $calendarWrap.find('.btn-set-date');

    currentYear = (currentYear == null) ? serverTime.year : currentYear;  // 서버에서 받은 연도
    currentMonth = (currentMonth == null) ? serverTime.month : currentMonth;  // 서버에서 받은 월

    let startDateStr = savedStartDate;
    let endDateStr = savedEndDate;

    // 표시 복원
    if (startDateStr) {
        $tblCells.each(function () {
            if ($(this).attr('data-date') === startDateStr) {
                $(this).addClass('period start');
                // 단일 날짜인 경우 end도 추가로 붙여야함
                if (mode === 'single') {
                    $(this).addClass('end');
                }
                $(this).find('.btn-set-date').attr('aria-pressed', 'true');
            }
        });
    }
    if (endDateStr) {
        $tblCells.each(function () {
            if ($(this).attr('data-date') === endDateStr) {
                $(this).addClass('period end');
                $(this).find('.btn-set-date').attr('aria-pressed', 'true');
            }
        });

        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        $tblCells.each(function () {
            const current = new Date($(this).data('date'));
            if (current > start && current < end) {
                $(this).addClass('period');
                $(this).find('.btn-set-date').attr('aria-pressed', 'true');
            }
        });
    }

    // 연도 클릭 시 드롭다운 생성
    $calendarWrap.off('click', '.btn-cal-switch.year').on('click', '.btn-cal-switch.year', function () {
        $calendarWrap.find('.calendar-year-wrap').remove();
        $calendarWrap.find('.calendar-mon-wrap').remove();

        const $btn = $(this);
        
        //const startYear = serverTime.year - 1;  // 작년
        const startYear = serverTime.year - 100;  // 올해 기준 - 100년
        const endYear = serverTime.year + 10;   // 올해 기준 +10년

        const $wrap = $('<div class="calendar-select calendar-year-wrap active">');
        const $ul = $('<ul class="sel year" role="listbox">');

        for (let y = startYear; y <= endYear; y++) {
            const $li = $('<li role="none">');
            const $button = $(`<button type="button" role="option" aria-selected="${y === currentYear}">${y}년</button>`);

            if (y === currentYear) {
                $button.addClass('active').attr('aria-selected', 'true'); // 선택된 연도에 active 클래스 적용
            } else {
                $button.attr('aria-selected', 'false');
            }

            $button.data('year', y);
            $li.append($button);
            $ul.append($li);
        }

        $wrap.append($ul);
        $btn.after($wrap);

        $ul.off('click').on('click', 'button', function (e) {
            e.stopPropagation();
            currentYear = Number($(this).data('year')); // 선택된 연도를 저장
            const month = currentMonth; // 현재 선택된 월
            $wrap.remove(); // 드롭다운 제거
            replaceCalendar($calendarWrap, currentYear, month, null, null, mode);
        });

        // 드롭다운이 추가된 후, 스크롤 위치를 조정
        const activeButton = $ul.find('button.active');
        if (activeButton.length > 0) {
            const scrollOffset = activeButton.offset().top - $ul.offset().top;
            $ul.scrollTop(scrollOffset); // 스크롤 위치 맞추기
        }
        
        // 드롭박스 제어
        if($btn[0].getAttribute('ariaExpanded') == 'true'){
			$btn[0].setAttribute('ariaExpanded','false');
			$wrap.remove(); // 드롭다운 제거
		}else{
			$btn[0].setAttribute('ariaExpanded','true');
		}
        
    });

	// 월 클릭 시 드롭다운 생성
    $calendarWrap.off('click', '.btn-cal-switch.month').on('click', '.btn-cal-switch.month', function () {
        $calendarWrap.find('.calendar-mon-wrap').remove();
        $calendarWrap.find('.calendar-year-wrap').remove();

        const $btn = $(this);

        const $wrap = $('<div class="calendar-select calendar-mon-wrap active">');
        const $ul = $('<ul class="sel month" role="listbox">');

        // 1월부터 12월까지 월 생성
        for (let m = 1; m <= 12; m++) {
            const label = `${String(m).padStart(2, '0')}월`;
            const $li = $('<li role="none">');
            const $button = $(`<button type="button" role="option" aria-selected="${m === currentMonth}">${label}</button>`);

            if (m === currentMonth) {
                $button.addClass('active').attr('aria-selected', 'true'); // 선택된 월에 active 클래스 적용
            } else {
                $button.attr('aria-selected', 'false');
            }

            $button.data('month', m);
            $li.append($button);
            $ul.append($li);
        }

        $wrap.append($ul);
        $btn.after($wrap);

        $ul.off('click').on('click', 'button', function (e) {
            e.stopPropagation();
            currentMonth = Number($(this).data('month')); // 선택된 월을 저장
            const year = currentYear; // 현재 선택된 연도
            $wrap.remove(); // 드롭다운 제거
            replaceCalendar($calendarWrap, year, currentMonth, null, null, mode);
        });

        // 드롭다운이 추가된 후, 스크롤 위치를 조정
        const activeButton = $ul.find('button.active');
        if (activeButton.length > 0) {
            const scrollOffset = activeButton.offset().top - $ul.offset().top;
            $ul.scrollTop(scrollOffset); // 스크롤 위치 맞추기
        }
        
        // 드롭박스 제어
        if($btn[0].getAttribute('ariaExpanded') == 'true'){
			$btn[0].setAttribute('ariaExpanded','false');
			$wrap.remove(); // 드롭다운 제거
		}else{
			$btn[0].setAttribute('ariaExpanded','true');
		}
    });


    // 날짜 클릭
    $tblCellBtns.off('click').on('click', function () {
        const $td = $(this).closest('td');
        const clickedDateStr = $td.data('date');
        const clickedDate = new Date(clickedDateStr);

        // 초기화
        $tblCells.removeClass('period start end');
        $tblCellBtns.removeAttr('aria-pressed');

        // mode === 'single'일 경우: 선택한 날짜를 start와 end 둘 다에 넣음
        if (mode === 'single') {
            startDateStr = clickedDateStr;
            endDateStr = null;
            selectStartDateStr = startDateStr; selectEndDateStr = endDateStr;
            $td.addClass('period start end');
            $(this).attr('aria-pressed', 'true');
            updateConfirmButtonState($calendarWrap, startDateStr, endDateStr, mode);
            return;
        }

        // range 모드
        if (!startDateStr || (startDateStr && endDateStr)) {
            // 처음 선택하거나 다시 선택 시작
            startDateStr = clickedDateStr;
            endDateStr = null;
            selectStartDateStr = startDateStr; selectEndDateStr = endDateStr;
            $td.addClass('period start');
            $(this).attr('aria-pressed', 'true');
        } else {
            // 종료일 선택
            endDateStr = clickedDateStr;

            let start = new Date(startDateStr);
            let end = new Date(endDateStr);

            if (start > end) {
                [startDateStr, endDateStr] = [endDateStr, startDateStr];
                [start, end] = [end, start];
            }

            $tblCells.each(function () {
                const dateStr = $(this).data('date');
                const current = new Date(dateStr);

                if (dateStr === startDateStr) {
                    $(this).addClass('period start');
                } else if (dateStr === endDateStr) {
                    $(this).addClass('period end');
                } else if (current > start && current < end) {
                    $(this).addClass('period');
                }

                $(this).find('.btn-set-date').attr('aria-pressed', 'true');
            });
            selectStartDateStr = startDateStr; selectEndDateStr = endDateStr;
        }

        // 버튼 상태 갱신
        updateConfirmButtonState($calendarWrap, startDateStr, endDateStr, mode);
    });

    // 오늘 버튼
    $calendarWrap.find('.get-today').off('click').on('click', async function () {
        const serverTime = await fetchServerTime();
        if (!serverTime) return;

        const todayStr = `${serverTime.year}.${String(serverTime.month).padStart(2, '0')}.${String(serverTime.day).padStart(2, '0')}`;

        if (mode === 'single') {
        	selectStartDateStr = todayStr;
            // 단일 모드 → 오늘 날짜 하나만 선택되도록
            replaceCalendar($calendarWrap, serverTime.year, serverTime.month, todayStr, null, mode);
        } else {
            // 범위 모드 → 오늘 날짜를 시작일로 설정, 종료일 초기화
            replaceCalendar($calendarWrap, serverTime.year, serverTime.month, todayStr, null, mode);
        }
    });

    // 취소
    $calendarWrap.find('.cancel-calendar').off('click').on('click', function () {
        $calendarWrap.remove();
    });

    // 확인
    $calendarWrap.find('.confirm-calendar').off('click').on('click', function () {
        // 현재 달력 컨테이너의 부모 요소를 찾고
        const $calendarCont = $calendarWrap.closest('.form-group');

        // .calendar-conts 안에서 첫 번째와 두 번째 input을 찾는다
        const $inputs = $calendarCont.find('input.krds-input.datepicker.cal');

        // 범위 선택을 나타내는 클래스가 붙은 날짜들
        const $startDateButton = $calendarWrap.find('.period.start');
        const $endDateButton = $calendarWrap.find('.period.end');

        // 선택된 날짜들
        //const startDateStr = $startDateButton.length ? $startDateButton.data('date') : null;  // 시작일
        //const endDateStr = $endDateButton.length ? $endDateButton.data('date') : null;        // 종료일

        // 'single' 모드인 경우, 시작일만 설정
        if (mode === 'single') {
            if ($inputs.length > 0 && selectStartDateStr) {
                $inputs.eq(0).val(selectStartDateStr);  // 첫 번째 input에 시작일 설정
            }
        } else {
            // 범위 모드인 경우, 시작일과 종료일 설정
            if ($inputs.length > 0 && selectStartDateStr) {
                $inputs.eq(0).val(selectStartDateStr);  // 첫 번째 input에 시작일 설정
            }
            if ($inputs.length > 1 && selectEndDateStr) {
                $inputs.eq(1).val(selectEndDateStr);    // 두 번째 input에 종료일 설정
            }
        }

        // 달력 닫기
        $calendarWrap.remove();
    });
    
    // 월 이동
    $calendarWrap.find('.btn-cal-move').off('click').on('click', function (e) {
        e.stopPropagation();
        const isPrev = $(this).hasClass('prev');
        let year = parseInt($calendarWrap.find('.calendar-switch-wrap .year').text(), 10);
        let month = parseInt($calendarWrap.find('.calendar-switch-wrap .month').text(), 10);

        if (isPrev) month--;
        else month++;

        if (month < 1) {
            month = 12;
            year--;
        } else if (month > 12) {
            month = 1;
            year++;
        }

        // 중요! 새로 만든 달력의 래퍼를 다시 찾아서 새롭게 init 해야 이벤트가 살아남
        const $calendarArea = $calendarWrap.closest('.krds-calendar-area');
        const $newCalendar = createCalendar(year, month);

        // 래퍼만 유지, 내부만 교체
        $calendarWrap.empty().append($newCalendar.children());

        // 다시 이벤트 연결
        initCalendarUI($calendarWrap, startDateStr, endDateStr, mode);
    });

    updateConfirmButtonState($calendarWrap, startDateStr, endDateStr, mode);
}

function updateConfirmButtonState($calendarWrap, startDateStr, endDateStr, mode) {
    const $confirmBtn = $calendarWrap.find('.confirm-calendar');

    if (
        (mode === 'single' && startDateStr) ||
        (mode === 'range' && startDateStr && endDateStr)
    ) {
        $confirmBtn.prop('disabled', false);
    } else {
        $confirmBtn.prop('disabled', true);
    }
}

// 기존 달력 교체
function replaceCalendar($calendarWrap, year, month, startDate, endDate, mode) {
    const $calendarArea = $calendarWrap.closest('.krds-calendar-area');
    const $originalWrap = $calendarArea.find('.calendar-wrap');

    // 1. 새로운 달력 콘텐츠 생성
    const $newCalendar = createCalendar(year, month);

    // 2. 기존 래퍼의 콘텐츠만 비우고 새로 생성한 달력 내부 내용만 이식
    $originalWrap.empty().append($newCalendar.children());

    // 3. 다시 초기화
    initCalendarUI($originalWrap, startDate, endDate, mode);
}

