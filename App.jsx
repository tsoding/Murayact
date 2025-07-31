const React = require('react');

exports.App = () => {
    const [count, setCount] = React.useState(0);
    const clickMe = () => {
        setCount(count + 1);
    }
    return <button onClick={clickMe}>Click me! ({count})</button>;
};
