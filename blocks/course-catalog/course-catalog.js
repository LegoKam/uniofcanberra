const DEFAULT_API = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSay4Xe-pjISF73XwDlALajDy3HyBaDPmMgMtrv9SBzyiVOPAr_I3gfJUK34Cdit9qI-ry-HxnsO0lgWdl9iV2Zorq9_jFY6Ge4xuGJey5U2Hzf4RKs6IDCCBWLkJh_QKp1_hLSm8TUyqUHTB2e8XSboRRgHGziIDxJbvnjq2Qlolj5N21rtReIsVdnY2zvjjglK_lP2I1EyWnQArb57aJopRivV8Si8MsRubiGTXJwy35obswdKYT3sEbCI-8J5ttZs60Q42-3vegJhde6Ma5vmR89ig&lib=McI758pGcVz3y2ie2K0qCakWpqKg1bUk2';

const PERSONAS = [
  { id: 'future', label: 'A future student' },
  { id: 'current', label: 'A current student' },
  { id: 'alumni', label: 'Alumni' },
  { id: 'staff', label: 'Staff member' },
];

function getStudyLevel(courseName = '') {
  const name = courseName.toLowerCase();
  if (name.includes('master') || name.includes('graduate certificate') || name.includes('graduate diploma')) {
    return 'Graduate';
  }
  if (name.includes('bachelor') || name.includes('diploma')) {
    return 'Undergraduate';
  }
  return 'Other';
}

function normalizeCourse(raw) {
  return {
    code: raw['Course Code'] || '',
    name: raw['Course Name'] || '',
    faculty: raw.Faculty || '',
    description: raw['Course Description'] || '',
    delivery: raw['Delivery Mode'] || '',
    duration: raw['Duration & Credit Points'] || '',
    studyLevel: getStudyLevel(raw['Course Name']),
  };
}

function getApiUrl(block) {
  const link = block.querySelector('a[href]');
  if (link?.href && !link.href.endsWith('#')) return link.href;
  return DEFAULT_API;
}

function buildSelect(id, label, options, allLabel = 'All') {
  const field = document.createElement('div');
  field.className = 'course-catalog-filter-field';

  const fieldLabel = document.createElement('label');
  fieldLabel.setAttribute('for', id);
  fieldLabel.textContent = label;

  const select = document.createElement('select');
  select.id = id;
  select.name = id;
  select.innerHTML = `<option value="">${allLabel}</option>${options.map((opt) => `<option value="${opt}">${opt}</option>`).join('')}`;

  field.append(fieldLabel, select);
  return field;
}

function buildTile(course) {
  const tile = document.createElement('article');
  tile.className = 'course-catalog-tile';

  const link = document.createElement('a');
  link.className = 'course-catalog-tile-link';
  link.href = `/courses/${course.code}`;

  const title = document.createElement('h3');
  title.textContent = `${course.name} (${course.code})`;

  const description = document.createElement('p');
  description.textContent = course.description;

  const meta = document.createElement('p');
  meta.className = 'course-catalog-tile-meta';
  const metaLabel = document.createElement('strong');
  metaLabel.textContent = 'Study level:';
  meta.append(metaLabel, ` ${course.studyLevel}`);

  link.append(title, description, meta);
  tile.append(link);
  return tile;
}

function filterCourses(courses, state) {
  const query = state.query.trim().toLowerCase();

  return courses.filter((course) => {
    const matchesQuery = !query || [
      course.name,
      course.code,
      course.description,
      course.faculty,
    ].some((value) => value.toLowerCase().includes(query));

    const matchesFaculty = !state.faculty || course.faculty === state.faculty;
    const matchesDelivery = !state.delivery || course.delivery === state.delivery;
    const matchesStudyLevel = !state.studyLevel || course.studyLevel === state.studyLevel;

    return matchesQuery && matchesFaculty && matchesDelivery && matchesStudyLevel;
  });
}

function renderResults(grid, count, results) {
  grid.replaceChildren();
  count.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;

  if (!results.length) {
    const empty = document.createElement('p');
    empty.className = 'course-catalog-empty';
    empty.textContent = 'No courses match your search. Try adjusting your filters or search term.';
    grid.append(empty);
    return;
  }

  results.forEach((course) => grid.append(buildTile(course)));
}

function bindEvents(root, courses, state, refs) {
  const {
    searchInput, clearBtn, searchForm, filtersPanel, filtersToggle,
    facultySelect, deliverySelect, studyLevelSelect, resultsGrid, resultsCount,
  } = refs;

  const update = () => {
    const results = filterCourses(courses, state);
    renderResults(resultsGrid, resultsCount, results);
  };

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = searchInput.value;
    update();
  });

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    clearBtn.hidden = !searchInput.value;
    update();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.query = '';
    clearBtn.hidden = true;
    update();
    searchInput.focus();
  });

  filtersToggle.addEventListener('click', () => {
    const expanded = filtersToggle.getAttribute('aria-expanded') === 'true';
    filtersToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    filtersToggle.textContent = expanded ? 'Show filters' : 'Hide filters';
    filtersPanel.hidden = expanded;
  });

  [facultySelect, deliverySelect, studyLevelSelect].forEach((select) => {
    select.addEventListener('change', () => {
      state.faculty = facultySelect.value;
      state.delivery = deliverySelect.value;
      state.studyLevel = studyLevelSelect.value;
      update();
    });
  });

  root.querySelectorAll('input[name="persona"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.persona = input.value;
    });
  });

  update();
}

function buildMarkup(faculties, deliveries, studyLevels) {
  const wrapper = document.createElement('div');
  wrapper.className = 'course-catalog-inner';

  wrapper.innerHTML = `
    <section class="course-catalog-hero" aria-label="Course search">
      <fieldset class="course-catalog-personas">
        <legend>I am...</legend>
        ${PERSONAS.map((persona, index) => `
          <label class="course-catalog-persona">
            <input type="radio" name="persona" value="${persona.id}" ${index === 0 ? 'checked' : ''}>
            <span>${persona.label}</span>
          </label>
        `).join('')}
      </fieldset>

      <form class="course-catalog-search-form" role="search">
        <label class="course-catalog-search-label" for="course-catalog-search">Search for a course</label>
        <div class="course-catalog-search-row">
          <input id="course-catalog-search" type="search" placeholder="Search courses" autocomplete="off">
          <button type="button" class="course-catalog-clear" aria-label="Clear search" hidden>&times;</button>
          <button type="submit" class="course-catalog-search-submit">
            <span class="course-catalog-sr-only">Search</span>
          </button>
        </div>
      </form>

      <p class="course-catalog-view-all">
        <a href="/courses/default">View all courses</a>
      </p>
    </section>

    <section class="course-catalog-results-panel" aria-label="Course results">
      <h2 class="course-catalog-heading">Courses</h2>

      <button type="button" class="course-catalog-filters-toggle" aria-expanded="true">Hide filters</button>

      <div class="course-catalog-filters"></div>

      <p class="course-catalog-results-count" aria-live="polite">0 results</p>
      <div class="course-catalog-results" role="list"></div>
    </section>
  `;

  const filters = wrapper.querySelector('.course-catalog-filters');
  filters.append(
    buildSelect('course-catalog-faculty', 'Faculty', faculties),
    buildSelect('course-catalog-delivery', 'Delivery mode', deliveries),
    buildSelect('course-catalog-study-level', 'Study levels', studyLevels),
    buildSelect('course-catalog-discipline', 'Discipline', [], 'All disciplines'),
    buildSelect('course-catalog-location', 'Location', ['Canberra', 'Online'], 'All locations'),
    buildSelect('course-catalog-year', 'Academic year', ['2026', '2027'], 'All years'),
    buildSelect('course-catalog-period', 'Teaching periods', ['Semester 1', 'Semester 2'], 'All periods'),
    buildSelect('course-catalog-prereq', 'Has prerequisites', ['Yes', 'No'], 'Any'),
  );

  return wrapper;
}

export default async function decorate(block) {
  block.textContent = '';
  block.classList.add('loading');

  try {
    const response = await fetch(getApiUrl(block));
    if (!response.ok) throw new Error(`Failed to load courses (${response.status})`);

    const data = await response.json();
    const courses = data.map(normalizeCourse);

    const faculties = [...new Set(courses.map((course) => course.faculty).filter(Boolean))].sort();
    const deliveries = [...new Set(courses.map((course) => course.delivery).filter(Boolean))].sort();
    const studyLevels = [...new Set(courses.map((course) => course.studyLevel).filter(Boolean))].sort();

    const markup = buildMarkup(faculties, deliveries, studyLevels);
    block.append(markup);

    const state = {
      query: '',
      faculty: '',
      delivery: '',
      studyLevel: '',
      persona: 'future',
    };

    bindEvents(block, courses, state, {
      searchInput: block.querySelector('#course-catalog-search'),
      clearBtn: block.querySelector('.course-catalog-clear'),
      searchForm: block.querySelector('.course-catalog-search-form'),
      filtersPanel: block.querySelector('.course-catalog-filters'),
      filtersToggle: block.querySelector('.course-catalog-filters-toggle'),
      facultySelect: block.querySelector('#course-catalog-faculty'),
      deliverySelect: block.querySelector('#course-catalog-delivery'),
      studyLevelSelect: block.querySelector('#course-catalog-study-level'),
      resultsGrid: block.querySelector('.course-catalog-results'),
      resultsCount: block.querySelector('.course-catalog-results-count'),
    });
  } catch (error) {
    block.innerHTML = `<p class="course-catalog-error">Unable to load courses. Please try again later.</p>`;
    // eslint-disable-next-line no-console
    console.error('course-catalog failed to load', error);
  } finally {
    block.classList.remove('loading');
  }
}
