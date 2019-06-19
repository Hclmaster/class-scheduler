import React from 'react';
import "rbx/index.css";
import { Button } from "rbx";
import {hasConflict, buttonColor, getCourseTerm, getCourseNumber, timeParts} from './times.js';

const Course = ({course, state, user, db}) => (
    <Button color={buttonColor(state.selected.includes(course))}
            onClick={() => state.toggle(course)}
            onDoubleClick={user ? () => moveCourse({course, db}) : null}
            disabled={hasConflict(course, state.selected)}>
        {getCourseTerm(course)} CS {getCourseNumber(course)} : {course.title}
    </Button>
);

const saveCourse = (course, meets, db) => {
    db.child('courses').child(course.id).update({meets}).catch(error => alert(error));
};

const moveCourse = ({course, db}) => {
    const meets = prompt('Enter new meeting data, in this format:', course.meets);
    if (!meets) return;
    if (timeParts(meets).days) saveCourse(course, meets, db);
    else moveCourse(course);
};

export default Course;