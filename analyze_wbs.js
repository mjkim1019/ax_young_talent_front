

const sampleData = [
  {
    "Category": "SWING",
    "Phase": "분석",
    "Task": "신규 요건 분석",
    "StartDate": "2025-03-10",
    "EndDate": "2025-03-28",
    "Duration": 3,
    "Remarks": "Kick Off meeting 이후"
  },
  {
    "Category": "SWING",
    "Phase": "분석",
    "Task": "기존 19년도 소스 분석",
    "StartDate": "2025-03-10",
    "EndDate": "2025-03-28",
    "Duration": 3,
    "Remarks": ""
  },
  {
    "Category": "SWING",
    "Phase": "분석",
    "Task": "기존 업무 영향도 분석",
    "StartDate": "2025-03-10",
    "EndDate": "2025-03-28",
    "Duration": 3,
    "Remarks": ""
  }
];

function getWeekOfMonth(date) {
  const day = date.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

const months = ["3월", "4월", "5월", "6월", "7월", "8월", "9월"];
const weeks = ["1W", "2W", "3W", "4W"];

let header1 = "| 구분 |";
let header2 = "|:---|";
let subHeader1 = "| |";
let subHeader2 = "|:---|";

months.forEach(month => {
  header1 += ` ${month} | | | |`;
  subHeader1 += ` ${weeks.join(" | ")} |`;
  header2 += `:---:|:---:|:---:|:---:|`;
});


const tasksByPhase = sampleData.reduce((acc, task) => {
  const phase = task.Phase;
  if (!acc[phase]) {
    acc[phase] = [];
  }
  acc[phase].push(task);
  return acc;
}, {});

let table = `${header1}\n${subHeader1}\n`;

for (const phase in tasksByPhase) {
  table += `| **${phase}** |` + " |".repeat(months.length * weeks.length) + "\n";
  tasksByPhase[phase].forEach(task => {
    let row = `| ${task.Task} |`;
    const startDate = new Date(task.StartDate);
    const endDate = new Date(task.EndDate);
    const startMonth = startDate.getMonth() + 1;
    const startWeek = getWeekOfMonth(startDate);
    const endMonth = endDate.getMonth() + 1;
    const endWeek = getWeekOfMonth(endDate);

    let taskPlaced = false;
    for (let i = 0; i < months.length; i++) {
      const currentMonth = parseInt(months[i].replace("월", ""));
      for (let j = 0; j < weeks.length; j++) {
        const currentWeek = j + 1;
        if (currentMonth >= startMonth && currentMonth <= endMonth) {
          if (currentMonth === startMonth && currentWeek < startWeek) {
            row += " |";
            continue;
          }
          if (currentMonth === endMonth && currentWeek > endWeek) {
            row += " |";
            continue;
          }
          row += ` ${task.Task} |`;
          taskPlaced = true;
        } else {
          row += " |";
        }
      }
    }
    table += `${row}\n`;
  });
}

console.log(table);
