const DEFAULT_API = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSay4Xe-pjISF73XwDlALajDy3HyBaDPmMgMtrv9SBzyiVOPAr_I3gfJUK34Cdit9qI-ry-HxnsO0lgWdl9iV2Zorq9_jFY6Ge4xuGJey5U2Hzf4RKs6IDCCBWLkJh_QKp1_hLSm8TUyqUHTB2e8XSboRRgHGziIDxJbvnjq2Qlolj5N21rtReIsVdnY2zvjjglK_lP2I1EyWnQArb57aJopRivV8Si8MsRubiGTXJwy35obswdKYT3sEbCI-8J5ttZs60Q42-3vegJhde6Ma5vmR89ig&lib=McI758pGcVz3y2ie2K0qCakWpqKg1bUk2';
const MAX_RELATED = 3;

function getCourseCodeFromPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const coursesIndex = segments.indexOf('courses');
  if (coursesIndex === -1) return '';

  const code = segments[coursesIndex + 1];
  if (!code || code.toLowerCase() === 'default') return '';
  return code.toUpperCase();
}

function isDefaultCoursePath(pathname = window.location.pathname) {
  return /^\/courses\/default\/?$/i.test(pathname);
}

function getApiUrl(block) {
  const link = block.querySelector('a[href]');
  if (link?.href && !link.href.endsWith('#')) return link.href;
  return DEFAULT_API;
}

function normalizeCourse(raw) {
  return {
    code: (raw['Course Code'] || '').toUpperCase(),
    name: raw['Course Name'] || '',
    faculty: raw.Faculty || '',
    description: raw['Course Description'] || '',
  };
}

function getFacultyHintFromBlock(block) {
  const rows = [...block.children];

  for (const row of rows) {
    const directColumns = [...row.children];
    const columns = directColumns.length >= 2 ? directColumns : [...(directColumns[0]?.children || [])];
    if (columns.length < 2) continue;

    const key = columns[0].textContent.trim().toLowerCase();
    const value = columns[1].textContent.trim();

    if ((key === 'default' || key === 'faculty') && value) {
      return value;
    }
  }

  return '';
}

function clearAuthoringRows(block) {
  block.replaceChildren();
}

function renderError(block, message) {
  block.replaceChildren();
  const error = document.createElement('p');
  error.className = 'related-courses-error';
  error.textContent = message;
  block.append(error);
}

function renderEmpty(block, faculty) {
  block.replaceChildren();
  const info = document.createElement('p');
  info.className = 'related-courses-empty';
  info.textContent = `No related courses found for ${faculty}.`;
  block.append(info);
}

function buildCard(course) {
  const item = document.createElement('li');
  item.className = 'related-courses-item';

  const title = document.createElement('h3');
  const link = document.createElement('a');
  link.href = `/courses/${course.code.toLowerCase()}`;
  link.textContent = `${course.name} (${course.code})`;
  title.append(link);

  const description = document.createElement('p');
  description.textContent = course.description;

  item.append(title, description);
  return item;
}

function renderRelatedCourses(block, courses, faculty) {
  block.replaceChildren();

  const heading = document.createElement('h2');
  heading.className = 'related-courses-heading';
  heading.textContent = 'Related courses';

  const list = document.createElement('ul');
  list.className = 'related-courses-list';
  courses.forEach((course) => list.append(buildCard(course)));

  block.append(heading, list);
}

export default async function decorate(block) {
  block.classList.add('loading');

  try {
    const response = await fetch(getApiUrl(block));
    if (!response.ok) throw new Error(`Failed to load courses (${response.status})`);

    const courses = (await response.json()).map(normalizeCourse);
    const codeFromPath = getCourseCodeFromPath();
    const onDefaultPath = isDefaultCoursePath();
    const facultyHint = onDefaultPath ? getFacultyHintFromBlock(block) : '';
    clearAuthoringRows(block);

    let faculty = facultyHint;
    if (codeFromPath) {
      const currentCourse = courses.find((course) => course.code === codeFromPath);
      if (!currentCourse) {
        renderError(block, `Course not found for code ${codeFromPath}.`);
        return;
      }
      faculty = currentCourse.faculty;
    }

    if (!faculty) {
      renderError(block, 'No faculty provided for related course lookup on /courses/default.');
      return;
    }

    const related = courses
      .filter((course) => course.faculty === faculty && (!codeFromPath || course.code !== codeFromPath))
      .slice(0, MAX_RELATED);

    if (!related.length) {
      renderEmpty(block, faculty);
      return;
    }

    renderRelatedCourses(block, related, faculty);
  } catch (error) {
    renderError(block, 'Unable to load related courses. Please try again later.');
    // eslint-disable-next-line no-console
    console.error('related-courses failed to load', error);
  } finally {
    block.classList.remove('loading');
  }
}
