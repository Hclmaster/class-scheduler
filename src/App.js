import React, {useState, useEffect} from 'react';
import './App.css';
import "rbx/index.css";
import {Button, Container, Title} from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';


const Banner = ({title}) => (
    <Title>{title || '[Loading...]'}</Title>
);

const terms = {F: 'Fall', W: 'Winter', S: 'Spring'};

const days = ['M', 'Tu', 'W', 'Th', 'F'];

const daysOverlap = (days1, days2) => (
    days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hours1, hours2) => (
    Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

const timeConflict = (course1, course2) => (
    daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const courseConflict = (course1, course2) => (
    course1 !== course2
    && getCourseTerm(course1) === getCourseTerm(course2)
    && timeConflict(course1, course2)
);

const hasConflict = (course, selected) => (
    selected.some(selection => courseConflict(course, selection))
);

const meetsPat = /^(\d\d?):(\d\d)$/;

const timeParts = course => {
    const [matchStart, hh1, mm1] = meetsPat.exec(course.start) || [];
    const [matchsEnd, hh2, mm2] = meetsPat.exec(course.end) || [];

    return {
        hours: {
            start: hh1 * 60 + mm1 * 1,
            end: hh2 * 60 + mm2 * 1
        }
    };
};

const addCourseTimes = course => ({
    ...course,
    ...timeParts(course)
});

const addScheduleTimes = schedule => ({
    title: schedule.title,
    courses: Object.values(schedule.courses).map(addCourseTimes)
});

const getCourseTerm = course => (
    terms[course.id.charAt(0)]
);

const getCourseNumber = course => (
    course.id.slice(1, 4)
);

const Course = ({course, state}) => (
    <Button color={buttonColor(state.selected.includes(course))}
            onClick={() => state.toggle(course)}
            disabled={hasConflict(course, state.selected)}>
        {getCourseTerm(course)} CS {getCourseNumber(course)} : {course.title}
    </Button>
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

const CourseList = ({courses}) => {
    const [term, setTerm] = useState('Fall');
    const termCourses = courses.filter(course => (term === getCourseTerm(course)));
    const [selected, toggle] = useSelection();

    return (
        <React.Fragment>
            <TermSelector state={{term, setTerm}}/>
            <Button.Group>
                {termCourses.map(course => <Course key={course.id} course={course}
                                            state={{selected, toggle}}/>)}
            </Button.Group>
        </React.Fragment>
    );
};

const firebaseConfig = {
    apiKey: "AIzaSyB2fXuLpL0-VdZzU6_3_WLWXYb9i5sLezw",
    authDomain: "course-scheduler-3d94d.firebaseapp.com",
    databaseURL: "https://course-scheduler-3d94d.firebaseio.com",
    projectId: "course-scheduler-3d94d",
    storageBucket: "course-scheduler-3d94d.appspot.com",
    messagingSenderId: "535620491738",
    appId: "1:535620491738:web:0d567fb4b08c0a8f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

const App = () => {
    const [schedule, setSchedule] = useState({title: '', courses: []});

    useEffect(() => {
        const handleData = snap => {
            if(snap.val()) setSchedule(addScheduleTimes(snap.val()));
        };
        db.on('value', handleData, error => alert(error));
        return () => {db.off('value', handleData);};
    }, []);

    return (
        <Container>
            <Banner title={schedule.title}/>
            <CourseList courses={schedule.courses}/>
        </Container>
    );
};

export default App;