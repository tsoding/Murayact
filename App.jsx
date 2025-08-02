const React = require('react');

exports.App = () => {
    const [count, setCount] = React.useState(0);
    const clickMe = () => {
        setCount(count + 1);
    }
    return <button onClick={clickMe}>This is in fact React! ({count})</button>;
};
