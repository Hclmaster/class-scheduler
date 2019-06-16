import React, {useState, useEffect} from 'react';
import './App.css';
import {Button, Container, Title} from 'rbx';


const Banner = ({title}) => (
    <Title>{title || '[Loading...]'}</Title>
);

const terms = {F: 'Fall', W: 'Winter', S: 'Spring'};

const getCourseTerm = course => (
    terms[course.id.charAt(0)]
);

const getCourseNumber = course => (
    course.id.slice(1, 4)
);

const Course = ({course}) => (
    <Button>
        {getCourseTerm(course)} CS {getCourseNumber(course)} : {course.title}
    </Button>
);

const buttonColor = selected => (
    selected ? 'success' : null
);

const TermSelector = ({term}) => (
    <Button.Group hasAddons>
        {Object.values(terms)
            .map(value => <Button key={value}
                                  color={buttonColor(value === term)}>{value}</Button>)}
    </Button.Group>
);

const CourseList = ({courses}) => {
    const [term, setTerm] = useState('Fall');
    const termCourses = courses.filter(course => (term === getCourseTerm(course)));
    return (
        <React.Fragment>
            <TermSelector term={term}/>
            <Button.Group>
                {termCourses.map(course => <Course key={course.id} course={course}/>)}
            </Button.Group>
        </React.Fragment>
    );
};

const App = () => {
    // useState: returns two values (initial value; function used to update state)
    const [schedule, setSchedule] = useState({title: '', courses: []});
    const url = 'https://www.cs.northwestern.edu/academics/courses/394/data/cs-courses.php';
    useEffect(() => {
        const fetchSchedule = async () => {
            const response = await fetch(url);
            if (!response.ok) throw response;
            const json = await response.json();
            setSchedule(json);
        };
        fetchSchedule();
    }, []);

    return (
        <Container>
            <Banner title={schedule.title}/>
            <CourseList courses={schedule.courses}/>
        </Container>
    );
};

export default App;