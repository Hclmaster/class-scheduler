import React, { useState } from 'react';
import "rbx/index.css";
import { Button } from "rbx";
import Course from './Course';

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};

const getCourseTerm = course => (
    terms[course.id.charAt(0)]
);

const buttonColor = selected => (
    selected ? 'success' : null
);

const TermSelector = ({state}) => (
    <Button.Group hasAddons>
        {Object.values(terms)
            .map(value =>
                <Button key={value}
                        color={buttonColor(value === state.term)}
                        onClick={() => state.setTerm(value)}>
                    {value}
                </Button>)}
    </Button.Group>
);

const useSelection = () => {
    const [selected, setSelected] = useState([]);
    // toggle implements function as a variable, if selected, then unselected it;
    // if this one is unselected, then make it to be selected!
    const toggle = (x) => {
        setSelected(selected.includes(x) ? selected.filter(y => y !== x) : [x].concat(selected))
    };
    return [selected, toggle];
};

const CourseList = ({courses, user, db}) => {
    const [term, setTerm] = useState('Fall');
    const termCourses = courses.filter(course => (term === getCourseTerm(course)));
    const [selected, toggle] = useSelection();

    return (
        <React.Fragment>
            <TermSelector state={{term, setTerm}}/>
            <Button.Group>
                {termCourses.map(course => <Course key={course.id} course={course}
                                                   state={{selected, toggle}}
                                                   user={user} db={db}/>)}
            </Button.Group>
        </React.Fragment>
    );
};


export default CourseList;