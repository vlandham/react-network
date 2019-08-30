import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';

import './SidebarPage.scss';

/**
 * Layout for Page with Control Sidebar
 */
class SidebarPage extends Component {
  static propTypes = {
    /**
     * Content of the page
     */
    children: PropTypes.any.isRequired,

    /**
     * Classname to give container
     */
    name: PropTypes.string.isRequired,

    /**
     * Sidebar content
     */
    sidebar: PropTypes.any.isRequired,
  };

  /**
   * Render sidebar
   */
  renderSidebar() {
    const { sidebar } = this.props;
    return (
      <Col xl={3} md={3} className="Sidebar d-flex flex-column">
        {sidebar}
      </Col>
    );
  }

  /**
   * Render main
   */
  renderMain() {
    const { children } = this.props;

    return (
      <Col xl={9} md={9} className="Main">
        {children}
      </Col>
    );
  }

  /**
   * React render method
   */
  render() {
    const { name } = this.props;
    return (
      <Container fluid={true} className={name}>
        <Row className="flex-xl-nowrap">
          {this.renderSidebar()}
          {this.renderMain()}
        </Row>
      </Container>
    );
  }
}

export default SidebarPage;
