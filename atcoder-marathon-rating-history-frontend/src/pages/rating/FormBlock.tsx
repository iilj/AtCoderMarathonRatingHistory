import React, { useState, useMemo } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, Input, Row, FormGroup, Label, Col } from 'reactstrap';

interface Props {
  paramUser: string;
}

const generatePath = (user: string): string => `/rating/${user}`;

export const FormBlock: React.FC<Props> = (props) => {
  const { paramUser } = props;
  const [user, setUser] = useState(paramUser);
  const ratingPagePath = useMemo(() => generatePath(user), [user]);
  const history = useHistory();

  return (
    <>
      <Row>
        <Col sm={12}>
          <FormGroup style={{ width: '100%' }}>
            <Label for="input-user">ATCODER ID:</Label>
            <Input
              value={user}
              type="text"
              name="input-user"
              id="input-user"
              placeholder={user ? user : 'eivour'}
              onChange={(e): void => setUser(e.target.value)}
              onKeyPress={(e): void => {
                if (e.key === 'Enter') {
                  history.push(ratingPagePath);
                }
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Button
            color="primary"
            tag={NavLink}
            to={ratingPagePath}
            block
            style={{ display: 'block', marginTop: '0.5rem' }}
          >
            Go
          </Button>
        </Col>
      </Row>
    </>
  );
};
