import React, { useState } from "react";
import './tree.css';

const Tree = ({data = []}) => {
    return (
        <div className="d-tree">
            <ul className="d-flex d-tree-container flex-column">
                {data.map((tree) => (
                    <TreeNode key={tree.key} node={tree} />
                    
                ))}
            </ul>
        </div>
    )
}

const TreeNode = ({node}) => {
    const [childVisible, setChildVisibility] = useState(false);
    const hasChild = node.children && node.children.length > 0 ? true: false;
    
    function handle(){
        if(!childVisible)
            setChildVisibility(!childVisible);
    }

    return (
        <li className="mouse d-tree-node border-0">
            <div className="d-flex">
                <div className="col d-tree-head mouse">                    
                    <div onClick={handle} id={node.key} className={node.selecionada ? (node.key.trim() === node.selecionada.trim()? "selecionada": ""):""}>
                        <i onClick={ e => setChildVisibility(v => !v)} className={ hasChild?`mr-1 ${childVisible ?"bi bi-dash-square": "bi bi-plus-square"}`: "" }></i> {node.label}
                    </div>
                </div>
            </div>

            {
                hasChild && childVisible && 
                <div className="d-tree-content">
                    <ul className="d-flex d-tree-container flex-column">
                        <Tree data={node.children}/>
                    </ul>
                </div>
            }
        </li>
    )
}

export default Tree