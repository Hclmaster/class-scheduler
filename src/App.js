import React, {useState, useEffect} from 'react';
import './App.css';
import "rbx/index.css";
import {Button, Container, Title, Message} from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const terms = {F: 'Fall', W: 'Winter', S: 'Spring'};

const days = ['M', 'Tu', 'W', 'Th', 'F'];

const Banner = ({user, title}) => (
    <React.Fragment>
        {user ? <Welcome user={user} /> : <SignIn />}
        <Title>{title || '[Loading...]'}</Title>
    </React.Fragment>
);

const Welcome = ({user}) => (
    <Message color="info">
        <Message.Header>
            Welcome, {user.displayName}
            <Button color={'primary'}
                    onClick={() => firebase.auth().signOut()}>
                Log Out
            </Button>
        </Message.Header>
    </Message>
);

const SignIn = () => (
    <StyledFirebaseAuth
        uiConfig={uiConfig}
        firebaseAuth={firebase.auth()}
    />
)

const daysOverlap = (days1, days2) => (
    days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hour1, hour2) => (
    Math.max(hour1.start, hour2.start) < Math.min(hour1.end, hour2.end)
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

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?:\d\d) *[ -] *(\d\d?:\d\d) *$/;

const timeParts = meets => {
    const [match, days, start, end] = meetsPat.exec(meets) || [];

    return !match ? {} : {
        days,
        start: start,
        end: end
    };
};

const timePat = /^(\d\d?):(\d\d)$/;

const formatTime = course => {
    const[matchStart, hh1, mm1] = timePat.exec(course.start) || [];
    const[matchEnd, hh2, mm2] = timePat.exec(course.end) || [];
    return {
        hours: {
            start: hh1 * 60 + mm1 * 1,
            end: hh2 * 60 + mm2 * 1
        }
    }
};

const addCourseTimes = course => ({
    ...course,
    ...formatTime(course)
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
            onDoubleClick={() => moveCourse(course)}
            disabled={hasConflict(course, state.selected)}>
        {getCourseTerm(course)} CS {getCourseNumber(course)} : {course.title}
    </Button>
);

const saveCourse = (course, meets) => {
    db.child('courses').child(course.id).update(meets)
        .catch(error => alert(error));
};

const moveCourse = course => {
    const meets = prompt('Enter new meeting data, in this format:', course.days+' '+course.start+'-'+course.end);
    if(!meets) return;
    const result = timeParts(meets);
    if(result.days) saveCourse(course, result);
    else moveCourse(course);
};

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

const uiConfig = {
    signInFlow: 'popup',
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
    ],
    callbacks: {
        signInSuccessWithAuthResult: () => false
    }
};

const App = () => {
    const [schedule, setSchedule] = useState({title: '', courses: []});
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleData = snap => {
            if(snap.val()) setSchedule(addScheduleTimes(snap.val()));
        };
        db.on('value', handleData, error => alert(error));
        return () => {db.off('value', handleData);};
    }, []);

    useEffect(() => {
        firebase.auth().onAuthStateChanged(setUser);
    }, []);

    return (
        <Container>
            <Banner title={schedule.title} user={user}/>
            <CourseList courses={schedule.courses} user={user}/>
        </Container>
    );
};

export default App;