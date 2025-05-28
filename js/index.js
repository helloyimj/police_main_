$(function () {

    /***************************************************************
     * [1] Swiper 슬라이드 초기화 (즐겨찾기 캐러셀)
     ***************************************************************/
    // if (typeof Swiper !== 'undefined') {
    //     new Swiper('.favorite-carousel .swiper', {
    //         slidesPerView: 7,
    //         slidesPerGroup: 1,
    //         spaceBetween: 25,
    //         loop: false,
    //         centeredSlides: false,
    //         navigation: {
    //             nextEl: '.swiper-button-next',
    //             prevEl: '.swiper-button-prev'
    //         },
    //         pagination: {
    //             el: '.swiper-pagination',
    //             clickable: true
    //         }
    //     });
    // }

    if (typeof Swiper !== 'undefined') {
    new Swiper('.favorite-carousel .swiper', {
        slidesPerView: 7,
        slidesPerGroup: 1,
        spaceBetween: 25,
        loop: false,
        centeredSlides: false,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        // 추가된 그리드 및 반응형 설정
        breakpoints: {
            // 모바일: width <= 768px
            0: {
                slidesPerView: 3,
                slidesPerGroup: 6,
                spaceBetween: 6,
                grid: {
                    rows: 2,
                    fill: 'row'
                }
            },
            // 태블릿 이상: 768px 초과
            769: {
                slidesPerView: 7,
                slidesPerGroup: 1,
                spaceBetween: 6,
                grid: {
                    rows: 1
                }
            }
        }
    });
}

    /***************************************************************
     * [2] 메인 배너 롤링 (Fade 방식)
     ***************************************************************/
    const $slides = $('.banner-slide');
    const $currentPage = $('#current-page');
    const $totalPage = $('#total-page');
    const $togglePlayBtn = $('#toggle-play');
    const $prevBtn = $('#prev-btn');
    const $nextBtn = $('#next-btn');

    let currentIndexBanner = 0;
    let intervalId = null;
    let isPlaying = true;
    const total = $slides.length;

    if ($totalPage.length && $currentPage.length) {
        $totalPage.text(total);
        $currentPage.text(currentIndexBanner + 1);
    }

    function showSlide(index) {
        $slides.removeClass('active').css('z-index', '0').css('opacity', 0);
        $slides.eq(index).addClass('active').css({ zIndex: 1, opacity: 1 });

        $currentPage.text(index + 1);
    }

    function nextSlide() {
        currentIndexBanner = (currentIndexBanner + 1) % total;
        showSlide(currentIndexBanner);
    }

    function prevSlide() {
        currentIndexBanner = (currentIndexBanner - 1 + total) % total;
        showSlide(currentIndexBanner);
    }

    function startAutoPlay() {
        intervalId = setInterval(nextSlide, 4000);
        isPlaying = true;
        $togglePlayBtn.removeClass('play').addClass('pause');
    }

    function stopAutoPlay() {
        clearInterval(intervalId);
        isPlaying = false;
        $togglePlayBtn.removeClass('pause').addClass('play');
    }

    $togglePlayBtn.on('click', function () {
        isPlaying ? stopAutoPlay() : startAutoPlay();
    });

    $prevBtn.on('click', function () {
        stopAutoPlay();
        prevSlide();
    });

    $nextBtn.on('click', function () {
        stopAutoPlay();
        nextSlide();
    });

    if (total > 0) {
        showSlide(currentIndexBanner);
        startAutoPlay();
    }

    /***************************************************************
     * [3] 퀵링크 랭킹 자동 롤링 텍스트
     ***************************************************************/
    const rankingItems = [
        "범칙금 조회",
        "각종 범죄경력조회 신청",
        "견인등 대행법인등 지정신청",
        "경비업 폐업 신고",
        "경비원 배치 신고",
        "경비원 배치폐지 신고",
        "경비원 복장등 신청",
        "신임교육 이수 확인증 발급",
        "교통사고 사실확인원",
        "긴급자동차지정증재교부신청"
    ];
    const rankingLinks = [
		"/cvlcptDtl.do?cvlaId=MW-143",
		"https://crims.police.go.kr/",
		"/cvlcptDtl.do?cvlaId=MW-119",
		"/cvlcptDtl.do?cvlaId=MW-127",
		"/cvlcptDtl.do?cvlaId=MW-028",
		"/cvlcptDtl.do?cvlaId=MW-112",
		"/cvlcptDtl.do?cvlaId=MW-121",
		"/cvlcptDtl.do?cvlaId=MW-128",
		"/cvlcptDtl.do?cvlaId=MW-005",
		"/cvlcptDtl.do?cvlaId=MW-008"
	]

    let currentRankingIndex = 0;

    function renderRankingSlide($container, index) {
        const $wrapper = $container.find(".rolling-container");
        const $slides = $wrapper.find(".rolling-slide");

        // 기존 슬라이드 2개 이상일 경우 제거
        if ($slides.length > 1) {
            $slides.slice(0, -1).remove();
        }

        const $newSlide = $('<div class="rolling-slide"></div>')
            .css('transform', 'translateY(3rem)')
            .html(`<strong>${index + 1}.</strong><span class="label-text">${rankingItems[index]}</span>`);

        $wrapper.append($newSlide);

        // reflow 강제 유도
        $newSlide[0].offsetHeight;

        const $oldSlide = $wrapper.find('.rolling-slide').first();
        $newSlide.css('transform', 'translateY(0)');
        if ($oldSlide[0] !== $newSlide[0]) {
            $oldSlide.css('transform', 'translateY(-3rem)');
            $oldSlide.on('transitionend', function () {
                $(this).remove();
            });
        }
    }

    const $quickLinkContainer = $('.quick-link-dropdown');
    if ($quickLinkContainer.length) {
        renderRankingSlide($quickLinkContainer, currentRankingIndex);

        setInterval(function () {
            if (!$quickLinkContainer.hasClass('open')) {
                currentRankingIndex = (currentRankingIndex + 1) % rankingItems.length;
                renderRankingSlide($quickLinkContainer, currentRankingIndex);
            }
        }, 3000);
    }

    /***************************************************************
     * [4] 드롭다운 펼치기 기능
     ***************************************************************/
    window.toggleDropdown = function (el) {
        const $container = $(el).closest('.quick-link-dropdown');
        const $existingList = $container.find('.dropdown-list');

        $container.toggleClass('open');

        if ($container.hasClass('open')) {
            if ($existingList.length === 0) {
                const $ul = $('<ul class="dropdown-list"></ul>');

                $.each(rankingItems, function (idx, item) {
                    const $li = $('<li></li>').text(`${idx + 1}. ${item}`).css('cursor', 'pointer');
                    if (idx === currentRankingIndex) {
                        $li.addClass('active');
                    }
                    
                    // 클릭 시 해당 링크로 새 창 열기
				    $li.on('click', function () {
				        const link = rankingLinks[idx];
				        // 절대 URL인지 상대 URL인지에 따라 다르게 처리할 수 있음
				        const isAbsolute = link.startsWith("http://") || link.startsWith("https://");
				        const url = isAbsolute ? link : window.location.origin + link;
				        window.location.href = url;
				    });
                    
                    $ul.append($li);
                });

                $container.append($ul);
            }
        } else {
            $existingList.remove();
        }
    };
    /***************************************************************
     * [5] 경찰 민원 채널 슬라이더 초기화
     ***************************************************************/
    if (typeof Swiper !== 'undefined') {
        new Swiper('.channel-carousel-wrap', {
            slidesPerView: 'auto',
            spaceBetween: 13,
            navigation: {
                nextEl: '.channel-btn.right',
                prevEl: '.channel-btn.left'
            }
        });
    }

/****************************************************************
 * [-] 퀵메뉴
 ****************************************************************/
var $menu = $('.floating-menu');
if (!$menu.length) return;

var remToPx = parseFloat($('html').css('font-size')); // 기본 10px
var initialTop = 68 * remToPx; // 
var minTop = 180;
var scrollRange = 600;

function isMobile() {
  return window.innerWidth <= 1024; // 모바일 판단 기준 (필요 시 조절)
}

function updateMenuPosition() {
  if (isMobile()) {
    $menu.css({
      position: 'fixed',
      top: '',
      bottom: '4.5rem',
    });
  } else {
    var scrollY = $(window).scrollTop();
    var ratio = Math.min(Math.max(scrollY / scrollRange, 0), 1);
    var newTop = initialTop - ratio * (initialTop - minTop);
    $menu.css({
      position: 'fixed',
      bottom: '',
      top: newTop + 'px',
    });
  }
}

$(window).on('scroll resize', updateMenuPosition);
$(document).ready(updateMenuPosition);

});