const React = require('react');

exports.App = () => {
    const [name, setName] = React.useState("");
    
    return <div>
        <label>Hello {name != "" ? name : "World"}</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder='Input Text' />
    </div>;
};
