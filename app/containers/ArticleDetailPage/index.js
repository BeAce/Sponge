import React from "react";
import PropTypes from "prop-types";
import marked from "marked";
import { Row, Col, Form, DatePicker, Input, Button, Spin } from "antd";
import highlightjs from "highlight.js";

import fetch from "../../lib/fetch";

const FormItem = Form.Item;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight(code) {
    return highlightjs.highlightAuto(code).value;
  }
});

class ArticleDetailForm extends React.Component {
  static propTypes = {
    form: PropTypes.object
  };

  state = {
    data: {},
    loading: false
  };

  componentDidMount() {
    this.setState({
      loading: true
    });
    fetch
      .get(`articles/${this.props.match.params.id}`)
      .then(data => {
        this.setState({
          data,
          loading: false
        });
      })
      .catch(error => {
        this.setState({
          loading: false
        });
        console.log(error);
      });
  }

  handleChange = value => {
    this.setState({ text: value });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      const values = {
        ...fieldsValue,
        date: fieldsValue["date"].format("YYYY-MM-DD HH:mm:ss")
      };
      console.log("Received values of form: ", values);
    });
  };

  createMarkup() {
    return {
      __html: this.props.form.getFieldValue("content")
        ? marked(this.props.form.getFieldValue("content"))
        : ""
    };
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const config = {
      rules: [{ type: "string", required: true, message: "say sth." }]
    };
    const dateConfig = {
      rules: [{ type: "object", required: true, message: "say sth." }]
    };
    const data = this.state.data;
    return (
      <Spin spinning={this.state.loading}>
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <FormItem label="id" style={{ display: "none" }}>
            {getFieldDecorator("id", {
              initialValue: this.props.match.params.id
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="标题">
            {getFieldDecorator("title", {
              initialValue: data.title
            })(<Input />)}
          </FormItem>
          <FormItem label="作者">
            {getFieldDecorator("author", {
              initialValue: data.author
            })(<Input />)}
          </FormItem>
          <FormItem label="时间">
            {getFieldDecorator("date", dateConfig)(
              <DatePicker
                style={{ width: "100%" }}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
              />
            )}
          </FormItem>
          <FormItem label="描述">
            {getFieldDecorator("abstract", {
              initialValue: data.abstract
            })(
              <Input.TextArea
                placeholder="输入描述"
                autosize={{ minRows: 6, maxRows: 8 }}
              />
            )}
          </FormItem>
          <Row gutter={16} type="flex">
            <Col span={12}>
              <FormItem label="正文">
                {getFieldDecorator("content", {
                  initialValue: data.content,
                  rules: [
                    { type: "string", required: true, message: "say sth." }
                  ]
                })(
                  <Input.TextArea
                    placeholder="正文。。。"
                    autosize={{ minRows: 80, maxRows: 80 }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="预览" style={{ height: "100%" }}>
                <div
                  dangerouslySetInnerHTML={this.createMarkup()}
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    height: "100%",
                    padding: 5
                  }}
                />
              </FormItem>
            </Col>
          </Row>
          <FormItem>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </FormItem>
        </Form>
      </Spin>
    );
  }
}

const ArticleDetailPage = Form.create()(ArticleDetailForm);

export default ArticleDetailPage;
