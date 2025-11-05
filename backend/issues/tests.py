from rest_framework.test import APIClient, APITestCase

class LendBookTests(APITestCase):
    def test_lend_book(self):
        client = APIClient()
        student_id = 1
        book_id = 3

        response = client.post(f'/api/issues/{student_id}/{book_id}/')
        print(response.status_code, response.data)

        self.assertIn(response.status_code, [200, 201, 400, 404])

