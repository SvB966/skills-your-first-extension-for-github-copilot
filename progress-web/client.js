async function loadStudents() {
  const res = await fetch('/api/students');
  const students = await res.json();
  const select = document.getElementById('studentSelect');
  select.innerHTML = '';
  students.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.name;
    select.appendChild(option);
  });
  if (students.length) {
    select.value = students[0].id;
    loadGrades();
  }
}

async function loadGrades() {
  const studentId = document.getElementById('studentSelect').value;
  const res = await fetch(`/api/students/${studentId}/grades`);
  const data = await res.json();
  const mapping = { A:4, B:3, C:2, D:1, F:0 };
  const labels = data.map(d => d.year + ' ' + d.course);
  const grades = data.map(d => mapping[d.grade] ?? Number(d.grade));

  if (window.chart) {
    window.chart.destroy();
  }
  const ctx = document.getElementById('gradesChart');
  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Grade', data: grades }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 4
        }
      }
    }
  });
}

document.getElementById('studentSelect').addEventListener('change', loadGrades);
loadStudents();
