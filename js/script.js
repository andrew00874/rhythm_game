$(function () {
  // ===== 게임 변수 초기화 =====
  let score = 0;
  let miss = 0;
  let timeLeft = 60;
  let gameActive = true;
  let gameInterval;
  let timerInterval;

  const keyMap = {
    d: 0,
    f: 1,
    j: 2,
    k: 3,
  };

  /**
   * 게임 시작 함수
   */
  $("#startBtn").click(function startGame() {
    gameInterval = setInterval(createItem, 800);
    timerInterval = setInterval(updateTimer, 1000);
  });

  /**
   * 타이머 업데이트 함수
   */
  function updateTimer() {
    timeLeft--;
    $("#timer").text(timeLeft);
    if (timeLeft <= 0) {
      endGame();
    }
  }

  /**
   * 게임 종료 함수
   */
  function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    $("#final-score").text(score);
    $("#final-miss").text(miss);
    $("#game-over").show();
  }

  /**
   * 아이템 생성 함수 (이름 변경: 아이템생성함수 -> createItem)
   */
  function createItem() {
    const lane = Math.floor(Math.random() * 4);
    const width = $(".lane").eq(lane).width();
    const item = $("<div class='note'>")
      .css({
        left: lane * width + "px",
        width: width + "px",
      })
      .data("lane", lane);

    $("#game-container").append(item);

    item.animate(
      { top: $("#game-container").height() + "px" },
      2000,
      "linear",
      function () {
        if (gameActive) {
          $(this).remove();
          miss++;
          $("#miss").text(miss);
        }
      }
    );
  }

  /**
   * 아이템 적중 시각 효과 생성 함수 (이름 변경: 성공함수 -> showHitEffect)
   */
  function showHitEffect(laneIndex) {
    const lane = $(".lane").eq(laneIndex);
    const laneOffset = lane.position();
    const effect = $("<div class='hit-effect'>").css({
      left: laneOffset.left + lane.width() / 2 - 30 + "px",
      top: $("#game-container").height() - 120 + "px",
    });

    $("body").append(effect);
    setTimeout(() => effect.remove(), 400);
  }

  /**
   * [1. 새로 추가] 판정 처리 함수
   * - 키보드, 마우스, 터치 입력에 대한 노트 판정을 모두 이 함수에서 처리합니다.
   * @param {number} laneIndex - 판정할 레인 번호 (0 ~ 3)
   */
  function processHit(laneIndex) {
    // 판정선 위치 계산
    const judgeLine = $("#game-container").height() - 80;

    // 해당 레인의 모든 아이템을 검사
    $(".note").each(function () {
      // 현재 아이템이 입력된 레인과 일치하는지 확인
      if ($(this).data("lane") === laneIndex) {
        const notePos = $(this).position().top + 25;

        // 아이템이 판정선 근처에 있는지 확인 (50px 오차 범위)
        if (Math.abs(notePos - judgeLine) < 50) {
          $(this).stop().remove();
          score++;
          $("#score").text(score);

          // 성공 시각 효과 실행
          showHitEffect(laneIndex);

          // 해당 키 버튼에 성공 효과 클래스 추가
          $(".key").eq(laneIndex).addClass("perfect");
          setTimeout(() => $(".key").eq(laneIndex).removeClass("perfect"), 300);

          return false; // .each() 루프 중단 (하나의 아이템만 처리)
        }
      }
    });

    // 성공/실패와 관계없이 키 눌림 효과를 보여줌
    $(".key").eq(laneIndex).addClass("passed");
    setTimeout(() => $(".key").eq(laneIndex).removeClass("passed"), 100);
  }

  /**
   * [2. 수정] 기존 키보드 입력 처리 함수
   * - 실제 판정 로직을 `processHit` 함수로 넘깁니다.
   */
  $(document).keydown(function (e) {
    const key = e.key.toLowerCase();
    if (!keyMap.hasOwnProperty(key)) {
      return;
    }
    const laneIndex = keyMap[key];
    processHit(laneIndex); // 분리된 판정 함수 호출
  });

  /**
   * [3. 새로 추가] 마우스 클릭 및 모바일 터치 이벤트 처리
   * - .key 클래스를 가진 버튼을 클릭(터치)했을 때
   */
  $(".key").on("click", function () {
    // 클릭된 버튼이 몇 번째 버튼인지 인덱스를 가져옴 (0, 1, 2, 3)
    const laneIndex = $(this).index();
    processHit(laneIndex); // 분리된 판정 함수 호출
  });

  startGame();
});
