const calendar = document.getElementById('calendar');
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();
const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();
const daysInMonth = lastDayOfPreviousMonth;
const preMonthBtn = document.getElementById('arrow-l');
const nextMonthBtn = document.getElementById('arrow-r');
let displayMonth = currentMonth;
let displayYear = currentYear;
let count = 0;

function displayCalendar(year, month) {
    // 月の初めの日を取得
    const firstDayOfMonth = new Date(year, month, 1);
    // 月の最後の日を取得
    const lastDayOfMonth = new Date(year, month + 1, 0);
    // 月の日数を計算
    const daysInMonth = lastDayOfMonth.getDate();

    let calendarHTML = '<table><thead><tr>';
    calendarHTML += `<td colspan="7" class="month">${year}年${month + 1}月</td>`;
    calendarHTML += '</tr></thead><tbody><tr>';
    for (let i = 0; i < 7; i++) {
        calendarHTML += `<th class="week">${['日', '月', '火', '水', '木', '金', '土'][i]}</th>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayOfWeek = new Date(year, month, i).getDay();
        if (i === 1) {
            calendarHTML += '<tr>';
            for (let j = 0; j < dayOfWeek; j++) {
                calendarHTML += '<td class="empty"></td>';
            }
        }
        calendarHTML += `<td class="day">${i}</td>`;
        if (dayOfWeek === 6) {
            calendarHTML += '</tr>';
            if (i < daysInMonth) {
                calendarHTML += '<tr>';
                count++;
            }
            if (count == 4 && i === daysInMonth) {
                calendarHTML += '</tr><tr>';
                for (let i = 0; i < 7; i++) {
                    calendarHTML += '<td class="empty"></td>';
                }
            }
        } else if (i === daysInMonth) {
            for (let j = dayOfWeek + 1; j <= 6; j++) {
                calendarHTML += '<td class="empty"></td>';
            }
            if (count == 4) {
                calendarHTML += '</tr><tr>';
                for (let i = 0; i < 7; i++) {
                    calendarHTML += '<td class="empty"></td>';
                }
            }
            calendarHTML += '</tr>';
        }
    }
    calendarHTML += '</tbody></table>';
    calendar.innerHTML = calendarHTML;
}

window.onload = function () {
    displayCalendar(currentYear, currentMonth);
    preMonthBtn.addEventListener('click', preMonth);
    nextMonthBtn.addEventListener('click', nextMonth);
    init();
};

function preMonth() {
    count = 0;
    console.log("前の月に");
    if (displayMonth === 0) {
        displayMonth = 11;
        displayYear--;
        displayCalendar(displayYear, displayMonth);
    } else {
        displayMonth--;
        displayCalendar(displayYear, displayMonth);
    }
    clickListener();
}

function nextMonth() {
    count = 0;
    console.log("次の月に");
    if (displayMonth === 11) {
        displayMonth = 0;
        displayYear++;
        displayCalendar(displayYear, displayMonth);
    } else {
        displayMonth++;
        displayCalendar(displayYear, displayMonth);
    }
    clickListener();
}

function clickListener() {
    const dayCells = document.querySelectorAll('.day');
    dayCells.forEach(cell => {
        cell.addEventListener('click', schedule);
    });
    function schedule(event) {
        console.log("Day clicked.");
        var clickDay = event.target.textContent;
        window.location.href = "schedule?year=" + displayYear + "&month=" + displayMonth + "&day=" + clickDay;
    }
}

function init() {
    clickListener();
}
