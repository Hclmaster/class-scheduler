import React, {useState, useEffect} from 'react';
import './App.css';
import "rbx/index.css";
import {Button, Container, Title, Message} from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import CourseList from './components/CourseList'

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

const Banner = ({user, title}) => (
    <React.Fragment>
        {user ? <Welcome user={user}/> : <SignIn/>}
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
);

const timeParts = meets => {
    const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];

    return !match ? {} : {
        days,
        hours: {
            start: hh1 * 60 + mm1,
            end: hh2 * 60 + mm2
        }
    };
};

const addCourseTimes = course => ({
    ...course,
    ...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
    title: schedule.title,
    courses: Object.values(schedule.courses).map(addCourseTimes)
});

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
            if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
        };
        db.on('value', handleData, error => alert(error));
        return () => {
            db.off('value', handleData);
        };
    }, []);

    useEffect(() => {
        firebase.auth().onAuthStateChanged(setUser);
    }, []);

    return (
        <Container>
            <Banner title={schedule.title} user={user}/>
            <CourseList courses={schedule.courses} user={user} db={db}/>
        </Container>
    );
};

export default App;