from rest_framework import pagination


class CoursePaginator(pagination.PageNumberPagination):
    page_size = 1


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 2


class HDBVKLPaginator(pagination.PageNumberPagination):
    page_size = 9 # Số lượng đối tượng mỗi trang

class KLTNPaginator(pagination.PageNumberPagination):
    page_size = 9

class TieuChiPaginator(pagination.PageNumberPagination):
    page_size = 10

class GiangVienPaginator(pagination.PageNumberPagination):
    page_size = 8



