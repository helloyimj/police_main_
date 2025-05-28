/**
 * 전체 템플릿에서 호출중인 마크애니 관련 function
 */

function MaManualLoad() {

}

/**
 * krds-main-menu의 실제 높이를 계산하여 header-in의 transform 계산에 사용할 수 있도록 CSS 변수로 주입함
 * 목적: scroll-down 상태에서 header 전체가 사라지지 않고 메뉴 영역만큼은 화면에 고정되도록 처리하기 위함
 * 주의: var(--krds-menu-height)는 .header-in 내부에서만 적용되므로 반드시 요소에 직접 style 변수로 주입해야 함
 * 조건: DOMContentLoaded 시점에 .krds-main-menu가 렌더링되어 있어야 함 (비동기 렌더링 시 작동 안함)
 **/
window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('#krds-header .header-in'); // transform 대상
    const menu = document.querySelector('.krds-main-menu');           // 높이 참조 대상

    if (header && menu) {
        const menuHeight = menu.offsetHeight; // px 단위 높이 계산
        header.style.setProperty('--krds-menu-height', `${menuHeight}px`); // inline style로 주입
    }
    
    
	/* 첨부파일 관련한 function들. */
	/* 단일 파일 업로드 */
    const fileInputs = document.querySelectorAll('input[type="file"][id^="file-upload-single"]');

    fileInputs.forEach((fileInput) => {
      fileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const fullFileName = file.name;
        const fileExt = fullFileName.includes('.') ? fullFileName.split('.').pop().toLowerCase() : '';
        const fileBaseName = fullFileName.lastIndexOf('.') > 0
          ? fullFileName.substring(0, fullFileName.lastIndexOf('.'))
          : fullFileName;

        const fileSizeBytes = file.size;
        let fileSizeText = '';
        if (fileSizeBytes < 1024) {
          fileSizeText = fileSizeBytes + "B";
        } else if (fileSizeBytes < 1024 * 1024) {
          fileSizeText = Math.round(fileSizeBytes / 1024) + "KB";
        } else {
          const sizeInMB = fileSizeBytes / (1024 * 1024);
          fileSizeText = (Math.round(sizeInMB * 10) / 10) + "MB";
        }

        const displayText = fileBaseName + " [" + fileExt + ", " + fileSizeText + "]";

        const idSuffix = this.id.replace("file-upload-single", "");
        const nameDisplay = document.getElementById("file-name-single" + idSuffix);

        if (nameDisplay) {
          nameDisplay.textContent = displayText;
        } else {
          console.warn("file-name-single" + idSuffix + " 요소를 찾을 수 없습니다.");
        }
      });
    });
    /*//단일파일 업로드 */
    
    /* 다중파일 업로드 */
    const multiUploadAreas = document.querySelectorAll('[data-upload-id]');
	  multiUploadAreas.forEach(multiArea => {			  
	    const multiId = multiArea.dataset.uploadId;
	    
	    const multiFileInput = multiArea.querySelector('#file-upload-' + multiId);
	    const multiUploadList = multiArea.querySelector('#file-list-' + multiId);
	    const multiTotalDisplay = multiArea.querySelector('#file-list-total-'+ multiId);
	    const multiDeleteAllBtn = multiArea.querySelector('#delete-file-all' + multiId.slice(-1));				    
	    
	    if (!multiFileInput || !multiUploadList || !multiTotalDisplay) return;

	    const multiMaxCount = parseInt(multiTotalDisplay.getAttribute("max"), 10) || 10;
	    multiFileInput.setAttribute("multiple", true);		
	    multiFileInput.addEventListener("change", function () {
	      const multiExisting = multiUploadList.querySelectorAll("li:not(.is-error)").length;
	      const multiIncomingFiles = Array.from(this.files);		      
	      if (multiExisting >= multiMaxCount || multiExisting + multiIncomingFiles.length > multiMaxCount) {
	        alert("최대 " + multiMaxCount + "개의 파일만 업로드할 수 있습니다.");
	        this.value = "";
	        return;
	      }
	      const multiAllowedFiles = multiIncomingFiles.slice(0, multiMaxCount - multiExisting);
	      console.log(3)
	      multiAllowedFiles.forEach(file => {
	        const li = document.createElement("li");
	        let fileBase = file.name;
	        let fileExt = "";
	        if (file.name.includes(".")) {
	          const lastDot = file.name.lastIndexOf(".");
	          fileBase = file.name.substring(0, lastDot);
	          fileExt = file.name.substring(lastDot + 1).toLowerCase();
	        } else {
	          fileExt = "파일";
	        }
	
	        const fileSize = file.size;
	        const fileSizeText =
	          fileSize < 1024 ? fileSize + "B" :
	          fileSize < 1024 * 1024 ? Math.round(fileSize / 1024) + "KB" :
	          (Math.round((fileSize / 1024 / 1024) * 10) / 10) + "MB";
	
	        const fileText = fileBase + " [" + fileExt + ", " + fileSizeText + "]";
	
	        // 용량 초과
	        if (file.size > 20 * 1024 * 1024) {
	          li.classList.add("is-error");
	          li.innerHTML = '<div class="file-info">' +
	            '<div class="file-name">' + fileText + '</div>' +
	            '<div class="btn-wrap">' +
	              '<button type="button" class="krds-btn medium text">삭제 <i class="svg-icon ico-delete-fill"></i></button>' +
	            '</div>' +
	          '</div>' +
	          '<p class="file-hint-invalid">등록 가능한 파일 용량을 초과하였습니다.<br>20MB 미만의 파일만 등록할 수 있습니다.</p>';
	          multiUploadList.appendChild(li);
	          multiAddDeleteHandler(li, multiUploadList, multiTotalDisplay);
	          multiUpdateFileCount(multiUploadList, multiTotalDisplay);
	          return;
	        }
	
	        // 업로드 중 표시
	        li.innerHTML = '<div class="file-info">' +
	          '<div class="file-name">' + fileText + '</div>' +
	          '<div class="btn-wrap">' +
	            '<span class="krds-spinner" role="status">' +
	              '<span class="sr-only">업로드 중</span>' +
	            '</span>' +
	          '</div>' +
	        '</div>';
	        multiUploadList.appendChild(li);
	        multiUpdateFileCount(multiUploadList, multiTotalDisplay);
	
	        setTimeout(() => {
	          const btnWrap = li.querySelector(".btn-wrap");
	          btnWrap.innerHTML = '<span class="ico-invalid complete">' +
	            '<em class="sr-only">업로드 완료</em>' +
	          '</span>';
	
	          setTimeout(() => {
	            btnWrap.innerHTML = '<button type="button" class="krds-btn small text">' +
	              '삭제 <i class="svg-icon ico-delete-fill"></i>' +
	            '</button>';
	            multiAddDeleteHandler(li, multiUploadList, multiTotalDisplay);
	          }, 2000);
	        }, 2000);
	      });
	
	      this.value = ""; // 초기화
	    });
	
	    if (multiDeleteAllBtn) {
	      multiDeleteAllBtn.addEventListener("click", () => {
	        multiUploadList.innerHTML = "";
	        multiUpdateFileCount(multiUploadList, multiTotalDisplay);
	      });
	    }
	  });
	
	  // 파일 개수 표시 갱신
	  function multiUpdateFileCount(multiUploadList, multiTotalDisplay) {
	    const count = multiUploadList.querySelectorAll("li:not(.is-error)").length;
	    const currentSpan = multiTotalDisplay.querySelector(".current");
	    if (currentSpan) {
	      currentSpan.textContent = count + "개";
	    }
	  }
	
	  // 삭제 버튼 이벤트 등록
	  function multiAddDeleteHandler(li, multiUploadList, multiTotalDisplay) {
	    const btn = li.querySelector("button");
	    if (btn) {
	      btn.addEventListener("click", () => {
	        li.remove();
	        multiUpdateFileCount(multiUploadList, multiTotalDisplay);
	      });
	    }
	  }
    /*//다중파일 업로드 */
    
	/*// 첨부파일 관련한 function들. */
});

/**
 * 공통 document ready
 **/
$(document).ready(function () {
    // 주소 검색 팝업 열기
    $(document).on('click', '.클릭-주소검색', function () {
        window.open(
            '/popup/juso.do',
            'jusoPopup',
            'width=570,height=420,scrollbars=yes,resizable=yes'
        );
    });

    // 단일 날짜 달력 팝업
    $(document).on('click', '.클릭-달력', async function () {
        // 1. 서버 시간 가져오기 (기본 기준 날짜로 사용)
        const serverTime = await fetchServerTime();
        if (!serverTime) return;

        // 2. 달력이 들어갈 컨테이너 찾기
        const $calendarConts = $(this).closest('.calendar-conts');
        const $calendarArea = $calendarConts.find('.krds-calendar-area');

        if ($calendarArea.length === 0) {
            console.error('krds-calendar-area를 찾을 수 없습니다.');
            return;
        }

        // 3. input에 입력된 날짜 읽기
        const inputDateStr = $calendarConts.find('input.krds-input.datepicker.cal').val()?.trim() || null;

        // 4. 초기 달력 생성 위치 설정 (기본은 서버 시간 기준)
        let initYear = serverTime.year;
        let initMonth = serverTime.month;
        let inputDate = null;

        // 5. 입력된 날짜가 유효한 형식이라면 초기화 기준으로 사용
        if (inputDateStr && /^\d{4}\.\d{2}\.\d{2}$/.test(inputDateStr)) {
            inputDate = inputDateStr;
            const parts = inputDateStr.split('.');
            initYear = parseInt(parts[0], 10);
            initMonth = parseInt(parts[1], 10);
        }

        // 6. 기존 달력 내용 비우기
        $calendarArea.empty();

        // 7. 새로운 달력 생성 및 삽입 (초기 연도/월 기준)
        const $calendar = createCalendar(initYear, initMonth);
        $calendarArea.append($calendar);

        // 8. 달력 UI 초기화 (단일 선택 모드로, 입력값 반영)
        initCalendarUI($calendar, inputDate, null, 'single');
    });

    // 기간 선택 달력 팝업
    $(document).on('click', '.클릭-달력-멀티', async function () {
        // 1. 서버 기준 날짜 가져오기
        const serverTime = await fetchServerTime();
        if (!serverTime) return;

        const $btn = $(this);
        const $formGroup = $btn.closest('.form-group');           // 시작/종료 input을 포함하는 그룹
        const $targetConts = $btn.closest('.calendar-conts');     // 클릭한 위치 기준으로 달력 이동

        // 2. input 값 가져오기
        const $inputs = $formGroup.find('input.krds-input.datepicker.cal');
        const startDateStr = $inputs.eq(0).val()?.trim() || null;
        const endDateStr = $inputs.eq(1).val()?.trim() || null;

        const validDateRegex = /^\d{4}\.\d{2}\.\d{2}$/;
        const isValidDate = str => validDateRegex.test(str);

        const startDate = isValidDate(startDateStr) ? startDateStr : null;
        const endDate = isValidDate(endDateStr) ? endDateStr : null;

        // 3. 달력 초기 위치: 시작일 > 종료일 > 서버 시간
        let initYear = serverTime.year;
        let initMonth = serverTime.month;

        if (startDate) {
            const [y, m] = startDate.split('.');
            initYear = parseInt(y, 10);
            initMonth = parseInt(m, 10);
        } else if (endDate) {
            const [y, m] = endDate.split('.');
            initYear = parseInt(y, 10);
            initMonth = parseInt(m, 10);
        }

        // 4. 달력 DOM 처리 (한 개만 유지)
        let $calendarArea = $btn.closest('.calendar-conts').find('.krds-calendar-area');
        $calendarArea.empty();

        // 5. 달력 생성 및 삽입
        const $calendar = createCalendar(initYear, initMonth);
        $calendarArea.append($calendar);

        // 6. UI 초기화 (기존 선택값 반영)
        initCalendarUI($calendar, startDate, endDate, 'range');
    });
    
    // 캘린더 모든 해당 클래스를 가진 요소를 선택
	const calInputs = document.querySelectorAll('.krds-input.datepicker.cal');

	// 각 요소에 maxlength 속성 추가
	calInputs.forEach(input => {
  		input.setAttribute('maxlength', '10');
	});
    
    function isValidDate(dateStr) {
	  if (!/^\d{4}\.\d{2}\.\d{2}$/.test(dateStr)) return false;
	
	  const [year, month, day] = dateStr.split('.').map(Number);
	  const date = new Date(year, month - 1, day);
	
	  return (
	    date.getFullYear() === year &&
	    date.getMonth() === month - 1 &&
	    date.getDate() === day
	  );
	}
    
	$('.krds-input.datepicker.cal').on('input', function () {
		let val = $(this).val().replace(/\D/g, ''); // 숫자 이외 제거
		
		if (val.length > 8) {
	    	val = val.slice(0, 8); // 최대 8자리까지 허용
	  	}
	
	  	// 날짜 형식으로 변환
	  	if (val.length === 8) {
	    	val = val.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3');
	  	}
	
	  	$(this).val(val);
	  	
	  	// 날짜 형식이 완성된 경우 유효성 검사 수행
	  	if (val.length === 10) {
	  		if (!isValidDate(val)) {
	    		$(this).closest('.calendar-input').addClass('is-error');
		    	$(this).closest('.form-group').find('.form-hint-invalid').remove();
		    	$(this).closest('.form-group').append('<p class="form-hint-invalid">올바른 형식이 아닙니다.</p>');    		
	    	}else{
				$(this).closest('.calendar-input').removeClass('is-error');
				$(this).closest('.form-group').find('.form-hint-invalid').remove();
				if($(this).closest('.input-group.m-column').children().find('.is-error').length != 0){
		    		$(this).closest('.form-group').append('<p class="form-hint-invalid">올바른 형식이 아닙니다.</p>');
				}
			}
	  	} else {
	  		// 아직 다 안 입력된 경우 초기화
	    	if($(this).closest('.input-group.m-column').children().find('.is-error').length == 0){
				$(this).closest('.calendar-input').removeClass('is-error');
				$(this).closest('.form-group').find('.form-hint-invalid').remove();
			}
	  	}
	  	
	});
});

// (MW-023) 임용예정자 인적사항 작성 추가 및 삭제하는 JS 코드
/** 임용예정자 인적사항 작성 추가/삭제  - start */
let uploadGroupIndex = 1;

function f_addUploadSet() {
  const list = document.getElementById('uploadList');
  const groupItems = [
    "이력서 1부(필수)",
    "주민등록증 사본 1부 (필수)",
    "민간인 신원진술서 1부 (필수)",
    "채용신체검사서 또는 취업용건강진단서 1부 (필수)",
    "기본증명서 1부 (필수)",
    "임용예정자 병적증명서 1부"
  ];
  
  // 최초 추가 버튼 제거
  const initialBtnWrap = document.getElementById('initialAddButtonWrap');
  if (initialBtnWrap) {
    initialBtnWrap.remove();
  }
  
  // 이전 그룹의 추가 버튼 제거
  const existingButtons = document.querySelectorAll('.page-btn-wrap');
  existingButtons.forEach(btnWrap => {
    const addBtn = btnWrap.querySelector('.add-btn');
    if (addBtn) addBtn.remove();
  });
  
  
  const groupDiv0 = document.createElement('div');
  groupDiv0.classList.add('upload-group');
  
  const groupDiv = document.createElement('ul');
  groupDiv.classList.add('krds-info-list', 'ordered');
  groupDiv.setAttribute('role', 'list');
  
  groupDiv0.appendChild(groupDiv);
  
//입력 폼 HTML 생성
  const inputForm = document.createElement('div');
  inputForm.className = 'form-group-row';
  inputForm.innerHTML = 
    '<div class="form-group">' +
      '<div class="form-tit">' +
        '<label for="apvlNm' + uploadGroupIndex + '">' +
          '<b>성명</b><span>(필수)</span>' +
        '</label>' +
      '</div>' +
      '<div class="form-conts">' +
        '<div class="input-group">' +
          '<input type="text" class="krds-input" name="apvlNm' + uploadGroupIndex + '" id="apvlNm' + uploadGroupIndex + '" maxlength="20" required data-name="성명"/>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="form-group">' +
      '<div class="form-tit">' +
        '<label for="apvlBrdt' + uploadGroupIndex + '">' +
          '<b>생년월일</b><span>(필수)</span>' +
        '</label>' +
      '</div>' +
      '<div class="form-conts">' +
        '<div class="input-group">' +
          '<input type="text" class="krds-input" name="apvlBrdt' + uploadGroupIndex + '" id="apvlBrdt' + uploadGroupIndex + '" maxlength="20" required data-name="생년월일"/>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="form-group">' +
      '<div class="form-tit">' +
        '<label for="apvlAddr' + uploadGroupIndex + '">' +
          '<b>주소</b><span>(필수)</span>' +
        '</label>' +
      '</div>' +
      '<div class="form-conts">' +
        '<div class="input-group">' +
          '<input type="text" class="krds-input" name="apvlAddr' + uploadGroupIndex + '" id="apvlAddr' + uploadGroupIndex + '" maxlength="20" required data-name="주소"/>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="form-group">' +
      '<div class="form-tit">' +
        '<label for="apvlMltrsvc' + uploadGroupIndex + '">' +
          '<b>병역</b><span>(필수)</span>' +
        '</label>' +
      '</div>' +
      '<div class="form-conts">' +
        '<select name="apvlMltrsvc' + uploadGroupIndex + '" class="krds-form-select" style="width: auto;" id="apvlMltrsvc' + uploadGroupIndex + '" title="병역" data-name="병역" required>' +
          '<option value="">:::선택해주세요:::</option>' +
          '<option value="1">필</option>' +
          '<option value="2">미필</option>' +
          '<option value="3">면제</option>' +
        '</select>' +
      '</div>' +
    '</div>' +
    '<br/>';

  // 첫 번째 항목에만 구분선 추가
  const separator = document.createElement('div');
  separator.style.height = '2px';
  separator.style.backgroundColor = '#ccc';
  separator.style.margin = '10px 0';
  
  // 기존 아이디가 1~6이므로 7부터 시작하도록 설정
  let startIndex = (uploadGroupIndex - 1) * 6 + 7;
  for (let i = 0; i < groupItems.length; i++) {
    const fileIndex = startIndex + i; // 유니크 번호 계산
    const li = document.createElement('li');
    li.setAttribute('role', 'listitem');

    const unicodeNum = String.fromCharCode(9311 + (i + 1)); // ① ~ ⑥
    
    let html =
      "<h4>" +
        "<span class='num'>" + unicodeNum + "</span> " + groupItems[i] +
      "</h4>"
  
  	  // 첨부파일 영역 생성
	  const fileWrap = document.createElement('div');
	  fileWrap.className = 'krds-file-upload line';
	  fileWrap.setAttribute('data-upload-id', 'multi' + (startIndex+i));

	  fileWrap.innerHTML = 
	  '<div class="file-upload">' + 
	    '<p class="txt">첨부할 파일을 여기에 끌어다 놓거나, 파일 선택 버튼을 눌러 파일을 직접 선택해주세요.</p>' +
	    '<div class="file-upload-btn-wrap">' +
	      '<input type="file" name="myFile'+(startIndex+i)+'" id="file-upload-multi'+(startIndex+i)+'" hidden multiple>' +
	      '<label for="file-upload-multi'+(startIndex+i)+'">' +
	        '<button type="button" class="krds-btn medium"><i class="svg-icon ico-upload"></i>파일선택</button>' +
	      '</label>' +
	    '</div>' +
	  '</div>' +
	  '<div class="file-list">' +
	    '<div class="total" id="file-list-total-multi'+(startIndex+i)+'" max=1><span class="current">0개</span> / 1개</div>' +
	    '<ul class="upload-list"  id="file-list-multi'+(startIndex+i)+'">' +
	    '</ul>' +
	    '<div class="upload-delete-btn">' +
	      '<button type="button" class="krds-btn xsmall tertiary" id="delete-file-all'+(startIndex+i)+'">전체 파일 삭제<i class="svg-icon ico-angle right"></i></button>' +
	    '</div>' +
	  '</div>';
      ;
      
    li.innerHTML = html;
    groupDiv.appendChild(li);
    groupDiv.appendChild(fileWrap);
  }
  
  // 버튼 영역 생성
  const btnWrap = document.createElement('div');
  btnWrap.className = 'btm-btn-wrap ';
  btnWrap.style.display = 'flex';
  btnWrap.style.gap = '10px';
  
  // 삭제 버튼
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('type', 'button');
  deleteBtn.className = 'krds-btn small tertiary';
  deleteBtn.textContent = '삭제';
  
  deleteBtn.onclick = function () {
  	list.removeChild(wrapperDiv);
  	
  	const remainingGroups = list.querySelectorAll('#uploadGroup');
  	
  	if (remainingGroups.length === 0) {
  	    // 최초 그룹만 남았을 때 - 추가 버튼 복원
  	    const initialBtnWrap = document.createElement('div');
  	    initialBtnWrap.className = 'page-btn-wrap';
  	    initialBtnWrap.id = 'initialAddButtonWrap';

  	    const initialAddBtn = createAddButton();
  	    initialBtnWrap.appendChild(initialAddBtn);

  	    list.after(initialBtnWrap); // uploadList 아래에 삽입
  	  } else {
  	    // 마지막 남은 그룹에 추가 버튼 다시 달기
  	    const lastGroup = remainingGroups[remainingGroups.length - 1];
  	    const existingBtnWrap = lastGroup.querySelector('.page-btn-wrap');
  	    if (existingBtnWrap) {
  	      const hasAddBtn = existingBtnWrap.querySelector('.krds-btn.primary');
  	      if (!hasAddBtn) {
  	        existingBtnWrap.appendChild(createAddButton());
  	      }
  	    }
  	  }
  	
  };
  
  btnWrap.appendChild(deleteBtn);
  btnWrap.appendChild(createAddButton());
  
  const wrapperDiv = document.createElement('div');
  wrapperDiv.id = 'uploadGroup'; // 원하는 ID로 지정
  
  wrapperDiv.appendChild(separator);
  wrapperDiv.appendChild(inputForm);
  
  const br = document.createElement('br');
  wrapperDiv.appendChild(br);
  
  wrapperDiv.appendChild(groupDiv);
  wrapperDiv.appendChild(br);
  wrapperDiv.appendChild(btnWrap);

  list.appendChild(wrapperDiv);
  
  uploadGroupIndex++;
}

// 삭제 기능
function deleteUploadItem(button) {
  // 삭제하려는 항목의 부모 요소(li)를 찾음
  const li = button.closest('li');

  // 첫 번째 항목은 삭제되지 않도록 함
  if (li !== li.closest('ul').firstElementChild) {
    li.remove();
  }
}

// 추가 버튼 생성 함수
function createAddButton() {
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'krds-btn small primary add-btn';
  addBtn.textContent = '추가';
  addBtn.onclick = f_addUploadSet;
  return addBtn;
}
