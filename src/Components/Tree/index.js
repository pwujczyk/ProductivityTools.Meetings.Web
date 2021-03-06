import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '@material-ui/core/SvgIcon';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Collapse from '@material-ui/core/Collapse';
import * as apiService from 'services/apiService'
import { Button, Checkbox } from '@material-ui/core';
import { Link, useParams } from "react-router-dom";
import ContextMenu from '../ContextMenu'
import './index.css'
import TreeItemNewModal from '../TreeItemNewModal'

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

function TransitionComponent(props) {
  const style = {
    from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
    to: { opacity: props.in ? 1 : 0, transform: `translate3d(${props.in ? 0 : 20}px,0,0)` },
  };

  return (
    <div style={style}>
      <Collapse {...props} />
    </div>
  );
}

TransitionComponent.propTypes = {
  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,
};

const StyledTreeItem = withStyles((theme) => ({
  iconContainer: {
    '& .close': {
      opacity: 0.3,
    },
  },
  group: {
    marginLeft: 7,
    paddingLeft: 18,
    borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
  },
}))((props) => <TreeItem {...props} TransitionComponent={TransitionComponent} />);

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 400,

  },
});

export default function CustomizedTreeView(props) {
  const [expanded, setExpanded] = useState([]);
  const classes = useStyles();
  const [list, setList] = useState([]);
  const params = useParams();

  const [modalOpen, setModalOpen] = useState(false);
  const handleModalClose = () => {
    setModalOpen(false);
  }
  const handleModalOpen = () => { setModalOpen(true); }

  const containerRef = useRef(null);

  useEffect(() => {

    const getNodePath = (node, targetId) => {
      if (targetId == null) return [];
      if (node != null) {
        if (node.id === targetId) {
          var result = [];
          result = result.concat([targetId.toString()]);
          return result;
        } else {
          for (let n of node.nodes) {
            //node.nodes.forEach(x=>{
            var chain = getNodePath(n, targetId);
            if (chain != null) {
              var finalResult = chain.concat(node.id.toString());
              setExpanded(finalResult)
              return finalResult;
            }
          }
        }
      }
      else {
        return [];
      }
    }

    const fetchData = async () => {
      const r = await apiService.getTree();
      console.log(r);
      setList(r);
      getNodePath(r[0], params.TreeId);
    };

    fetchData();
  }, [params.TreeId]);


  function getLabel(x) {
    let l = x.name + " [Id:" + x.id + "]";
    return l;
  }

  const treeClick = (e, treeId) => {
    e.stopPropagation();
    props.setSelectedTreeNode(treeId);
  }

  function GetNode(nodes) {
    if (nodes !== undefined) {
      return (nodes.map(x => {
        return <StyledTreeItem nodeId={x.id.toString()} contextmenuid={x.id} key={x.id} label={
          <div>
            <Link to="#" onClick={(e) => treeClick(e, x.id)}>{getLabel(x)}</Link>
          </div>}>{GetNode(x.nodes)}
        </StyledTreeItem>
      })
      )
    }
  }



  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const menuItems = [
    {
      text: 'Add new journal item',
      onclick: (treeId) => { props.setSelectedTreeNode(treeId); props.createNewMeeting(); console.log(`Item one from container  ${treeId} clicked`); }
    },
    {
      text: 'Add new tree item',
      onclick: (treeId) => { props.setSelectedTreeNode(treeId); handleModalOpen(); }
    }
  ];

  return (
    <div className='conainer' ref={containerRef}>
      <p>pawel</p>
      <TreeView
        className={classes.root}
        expanded={expanded}
        // expanded={getNodesIdRoot(list)}///recursive function
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
        onNodeToggle={handleToggle}
      >
        {list.map(x => {
          return <StyledTreeItem key={x.id} contextmenuid={x.id} nodeId={x.id.toString()} label={getLabel(x)}>{GetNode(x.nodes)}</StyledTreeItem>
        })}
      </TreeView>
      <ContextMenu parentRef={containerRef} items={menuItems}></ContextMenu>
      <TreeItemNewModal open={modalOpen} selectedTreeNode={props.selectedTreeNode} handleModalClose={handleModalClose} />
    </div>
  );
}
