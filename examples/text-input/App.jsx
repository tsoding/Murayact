const React = require('react');

exports.App = () => {
    const [name, setName] = React.useState("");
    const [age, setAge] = React.useState("");
    
    return <div>
        <label>Hello {name != "" ? name : "World"}</label>
        <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder='Input Text' />
        <label>Enter your Age</label>
        <input id="age" value={age} onChange={e => setAge(e.target.value)} />
    </div>;
};
